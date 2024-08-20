import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';

import { glob as globMod } from 'glob';
import { promptUser, isValidUrl, CSVParser, JSONParser } from './utils';
import { promisify } from 'util';
import { DEFAULT_GENERATED_MEDIA_DIR, getConfig, getEnvs } from './config';
import { ErrorGenerator } from './utils/errorGenerator';
import { ReportGenerator } from './utils/reportGenerator';
import { ExitHandlers } from './utils/exitHandlers';
import { SchemaValidator } from './utils/schemaValidator';
import { buildHashes } from './utils/integrityBuilder';
import { replaceUrls } from './utils/urlReplace';
import { NFTData } from './types';
import { outputJsonFiles } from './utils/outputJsonFiles';
import { UploadOutput } from './types/uploadOutput';
import { UrlMapper } from './utils/urlMapper';
const { version } = require('../package.json');

const glob = promisify(globMod);

const main = async () => {
    const VERSION = version;
    ReportGenerator.add(`Started Metadata Tool v${VERSION}`, true);
    ExitHandlers.init();

    let fileType: 'csv' | 'json' = 'csv';
    let folderPath = process.argv[2]; // path is passed as cli argument or dragged-dropped into the binary

    // STEP -> READ CONFIG.JSON
    let config = getConfig();
    const envs = getEnvs();

    // STEP -> DETERMINE FOLDER WHERE FILES ARE STORED
    // validate folder path
    ReportGenerator.add('Reading specified folder path.', false);
    if (!fs.existsSync(folderPath)) {
        const errorMessage = ErrorGenerator.get('INVALID_DIRECTORY', folderPath);
        ReportGenerator.add(errorMessage);

        ({ folderPath } = await inquirer.prompt([
            {
                type: 'input',
                name: 'folderPath',
                message: 'Enter directory path: ',
                validate(answer) {
                    return fs.existsSync(answer) ? true : ErrorGenerator.get('INVALID_DIRECTORY', answer);
                },
            },
        ]));
    }

    ReportGenerator.add(`Processing folder path: ${folderPath}`);

    // STEP -> READ FILES IN DIRECTORY
    // Check what file type to process; either csv or json
    const allFiles = (
        await glob(path.join(folderPath, `+(factory.+(json|csv)|tokens.csv||defaultToken.json||*.token.+(json))`), {
            windowsPathsNoEscape: true,
        })
    ).map((f) => {
        return path.basename(f);
    });

    const csvFiles = allFiles.filter((f) => {
        return path.extname(f) == '.csv';
    });

    const jsonFiles = allFiles.filter((f) => {
        return path.extname(f) == '.json';
    });

    // case when both filetypes are present, ask user to choose one.
    if (csvFiles.length > 0 && jsonFiles.length > 0) {
        ({ fileType } = await inquirer.prompt([
            {
                type: 'list',
                name: 'fileType',
                message: 'Both .json and .csv files found. Select filetype to process: ',
                choices: ['csv', 'json'],
            },
        ]));
    }
    // case when only json files are present, switch fileType to json
    else if (csvFiles.length == 0 && jsonFiles.length > 0) {
        fileType = 'json';
    }
    // else, default fileType is csv

    // STEP -> VALIDATE FILE LIST
    // check if factory.json|csv is present
    ReportGenerator.add('Validating file list.', false);
    const isCSV = fileType === 'csv';
    const files = isCSV ? csvFiles : jsonFiles;
    if (!files.includes(`factory.${fileType}`)) {
        const errorMessage = ErrorGenerator.get('MISSING_FACTORY_FILE', fileType);
        ReportGenerator.add(errorMessage);
        await promptUser(errorMessage);
        return;
    }

    // if processing csv files, notify if tokens file is present
    if (isCSV && files.includes(`tokens.${fileType}`)) {
        ReportGenerator.add(`tokens.${fileType} file was also found in the provided directory.`, true);
    }

    // STEP -> ENVIRONMENT SELECTION
    ReportGenerator.add('Prompting user for URL selection.', false);
    let { selectedEnv, customUrl }: { selectedEnv: string; customUrl: string } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedEnv',
            message: 'Select environment: ',
            choices: Object.keys(envs),
            when(answers) {
                // only ask when no env is specified in the config file OR when an env isn't selected by default
                return config && Object.keys(envs).length > 0 && !config?.environment ? true : false;
            },
        },
        {
            type: 'input',
            name: 'customUrl',
            message: 'Enter environment URL: ',
            when(answers) {
                return !answers.selectedEnv || answers.selectedEnv == 'custom'; // will only ask for custom url when "custom" env is selected or env selection was skipped
            },
            validate(answer) {
                return isValidUrl(answer) ? true : ErrorGenerator.get('INVALID_URL');
            },
        },
    ]);

    // if env selection was skipped, set selectedEnv to custom
    selectedEnv = selectedEnv ? selectedEnv : 'custom';

    // add custom env and it's url to env-url mapping
    if (selectedEnv == 'custom') {
        envs[selectedEnv] = customUrl;
    }

    // strip trailing slash in the env url, if any
    envs[selectedEnv] = envs[selectedEnv].endsWith('/') ? envs[selectedEnv].slice(0, -1) : envs[selectedEnv];

    // if config was not already set, set it
    if (!config) {
        config = {
            environment: selectedEnv,
            environmentUrl: envs[selectedEnv],
            collectionName: undefined,
            generatedMediaDir: DEFAULT_GENERATED_MEDIA_DIR,
            preserveNewLineCharacters: true,
        };
    } else {
        // else just update values
        config.environment = selectedEnv;
        config.environmentUrl = envs[selectedEnv];
    }

    if (
        typeof config == 'undefined' ||
        typeof config.environment === 'undefined' ||
        typeof config.environmentUrl === 'undefined'
    ) {
        ReportGenerator.add(`Failed to specify an environment or environment URL. Exiting process.`, true);
        return process.exit(1);
    }

    // STEP -> FILE PARSING & PROCESSING / CONVERSION
    // use csv or json parser, depending on the fileType
    ReportGenerator.add(`Parsing file types for ${fileType}`, false);
    const nftData = isCSV ? await CSVParser.parse(folderPath) : await JSONParser.parse(folderPath);

    // collection name is read from factory.csv/factory.json
    config.collectionName = nftData.factory.name;

    ReportGenerator.add(
        `Collection name: ${config.collectionName}, env: ${config.environment}, url: ${config.environmentUrl}`,
        false
    );

    // STEP -> SCHEMA VALIDATION
    ReportGenerator.add(`Validating schema files.`, false);

    let allValid = true;

    ReportGenerator.add(`Attempting to validate factory.`, false);

    /**
     * Use on-chain factory schema when validating json files
     * Use extended factory schema when validation csv files (because csv files will also have `tokenUriTemplate` property)
     */
    if (!SchemaValidator.validate(isCSV ? 'extendedFactory' : 'factory', nftData.factory)) {
        ReportGenerator.add(ErrorGenerator.get('INVALID_SCHEMA_FILE', `factory.${fileType}`));
        allValid = false;
    } else {
        ReportGenerator.add(`factory passed`, false);
    }

    if (nftData.defaultToken) {
        ReportGenerator.add(`Attempting to validate defaultToken.`, false);
        if (!SchemaValidator.validate('defaultToken', nftData.defaultToken)) {
            ReportGenerator.add(ErrorGenerator.get('INVALID_SCHEMA_FILE', `defaultToken.${fileType}`));
            allValid = false;
        } else {
            ReportGenerator.add(`defaultToken passed`, false);
        }
    }

    ReportGenerator.add(`Attempting to validate tokens.`, false);

    for (let i = 0; i < nftData.tokens.length; i++) {
        if (!SchemaValidator.validate('token', nftData.tokens[i])) {
            ReportGenerator.add(ErrorGenerator.get('INVALID_TOKEN_SCHEMA_AT', i));
            allValid = false;
        }
    }

    if (!allValid) {
        const errorMessage = ErrorGenerator.get('INVALID_SCHEMAS');
        ReportGenerator.add(errorMessage, false);
        await promptUser(errorMessage);
        process.exit(1);
    } else {
        ReportGenerator.add(`All Schemas Passed`, false);
    }

    // Only build hashes if filetype is CSV - for JSON files we just need to verify schema
    if (isCSV) {
        ReportGenerator.add(`Building Hashes`, true);
        const hashesNftData = await buildHashes<NFTData>(nftData, folderPath);

        // Create generated media directory if it doesn't exist
        if (!fs.existsSync(path.join(folderPath, config.generatedMediaDir))) {
            fs.mkdirSync(path.join(folderPath, config.generatedMediaDir));
        }

        ReportGenerator.add(`Replacing URLs with Hashed Content`, false);
        const updatedUrlsNftData = await replaceUrls<NFTData>(hashesNftData, folderPath, config);

        const fileHashData = await outputJsonFiles(updatedUrlsNftData, folderPath, config);
        const outputFilePath = path.join(folderPath, '/upload.json').replace(/\\/gm, '/');

        const outputData: UploadOutput = {
            collectionName: config.collectionName,
            factory: fileHashData.factory,
            defaultToken: fileHashData.defaultToken,
            tokens: fileHashData.tokens,
            media: UrlMapper.get(),
            environment: {
                env: config.environment,
                tokenUriTemplate: nftData.factory.tokenUriTemplate,
                url: config.environmentUrl,
                toolVersion: VERSION,
            },
        };

        ReportGenerator.add(`Writing final file: ${outputFilePath}`, true);
        fs.writeFileSync(outputFilePath, JSON.stringify(outputData, null, 2));
    }

    const exitMessage = `Finished Processing. Press [Enter] to Exit`;
    ReportGenerator.add(exitMessage, false);
    await promptUser(exitMessage);
};

main().catch((err) => {
    ReportGenerator.add(`Error occurred: ${err}`);
});
