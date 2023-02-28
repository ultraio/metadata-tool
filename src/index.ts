import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';

import { glob as globMod } from 'glob';
import { promptUser, isValidUrl, CSVParser, JSONParser } from './utils';
import { promisify } from 'util';
import { Config, getEnvironment, setCustomEnvironment } from './config';
import { ErrorGenerator } from './utils/errorGenerator';
import { ReportGenerator } from './utils/reportGenerator';
import { ExitHandlers } from './utils/exitHandlers';
import { SchemaValidator } from './utils/schemaValidator';
import { buildHashes } from './utils/integrityBuilder';
import { replaceUrls } from './utils/urlReplace';
import { Environment, NFTData } from './types';
import { outputJsonFiles } from './utils/outputJsonFiles';
import { UploadOutput } from './types/uploadOutput';
import { UrlMapper } from './utils/urlMapper';

const glob = promisify(globMod);

const main = async () => {
    ReportGenerator.add('Started Program', false);
    ExitHandlers.init();

    const config: Config = {};
    let fileType: 'csv' | 'json' = 'csv';
    let folderPath = process.argv[2]; // path is passed as cli argument or dragged-dropped into the binary

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
                choices: ['json', 'csv'],
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

    if (!isCSV && !files.includes(`defaultToken.json`)) {
        const errorMessage = ErrorGenerator.get('MISSING_DEFAULT_TOKEN_FILE', '.json');
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
    const {
        envType,
        customUrl,
        bucketName,
        bucketEndpoint,
    }: { envType: string; customUrl: string; bucketName: string; bucketEndpoint: string } = await inquirer.prompt([
        {
            type: 'list',
            name: 'envType',
            message: 'Select environment type: ',
            choices: ['dev', 'prod', 'qa', 'staging', 'custom'],
        },
        {
            type: 'input',
            name: 'customUrl',
            message: 'Enter custom URL: ',
            when(answers) {
                return answers.envType == 'custom'; // will only ask for custom url when "custom" env is selected
            },
            validate(answer) {
                return isValidUrl(answer) ? true : ErrorGenerator.get('INVALID_URL');
            },
        },
        {
            type: 'input',
            name: 'bucketName',
            message: 'Enter custom Wasabi/S3 bucket name: ',
            when(answers) {
                return answers.envType == 'custom'; // will only ask for custom url when "custom" env is selected
            },
        },
        {
            type: 'input',
            name: 'bucketEndpoint',
            message: 'Enter custom Wasabi/S3 bucket endpoint: ',
            when(answers) {
                return answers.envType == 'custom'; // will only ask for custom url when "custom" env is selected
            },
        },
    ]);

    config.environment = envType as Environment;
    if (envType == 'custom') {
        setCustomEnvironment(customUrl, bucketEndpoint, bucketName);
    }

    if (typeof config.environment === 'undefined') {
        ReportGenerator.add(`Failed to specify an environment. Exiting process.`, true);
        return process.exit(1);
    }

    // STEP -> FILE PARSING & PROCESSING / CONVERSION
    // use csv or json parser, depending on the fileType
    ReportGenerator.add(`Parsing file types for ${fileType}`, false);
    const nftData = isCSV ? await CSVParser.parse(folderPath) : await JSONParser.parse(folderPath);

    // collection name is read from factory.csv/factory.json
    config.collectionName = nftData.factory.name;

    ReportGenerator.add(`Validating if defaultToken was provided.`, false);
    if (typeof nftData.defaultToken === 'undefined') {
        const errorMessage = `defaultToken could not be processed and is missing.`;
        ReportGenerator.add(errorMessage, false);
        await promptUser(errorMessage);
        process.exit(1);
    }

    const env = getEnvironment(config?.environment);
    ReportGenerator.add(
        `Collection name: ${config.collectionName}, env: ${config.environment}, url: ${env.url}, endpoint: ${env.endpoint}, bucket: ${env.bucket}`,
        false
    );

    // STEP -> SCHEMA VALIDATION
    ReportGenerator.add(`Validating schema files.`, false);

    let allValid = true;

    ReportGenerator.add(`Attempting to validate factory.`, false);
    if (!SchemaValidator.validate('factory', nftData.factory)) {
        ReportGenerator.add(ErrorGenerator.get('INVALID_SCHEMA_FILE', `factory.${fileType}`));
        allValid = false;
    } else {
        ReportGenerator.add(`factory passed`, false);
    }

    ReportGenerator.add(`Attempting to validate defaultToken.`, false);
    if (!SchemaValidator.validate('defaultToken', nftData.defaultToken)) {
        ReportGenerator.add(ErrorGenerator.get('INVALID_SCHEMA_FILE', `defaultToken.${fileType}`));
        allValid = false;
    } else {
        ReportGenerator.add(`defaultToken passed`, false);
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

    ReportGenerator.add(`Building Hashes`, false);
    const hashesNftData = await buildHashes<NFTData>(nftData, folderPath);

    ReportGenerator.add(`Replacing URLs with Hashed Content`, false);
    const updatedUrlsNftData = await replaceUrls<NFTData>(hashesNftData, folderPath, config.collectionName, env.url);

    const fileHashData = await outputJsonFiles(updatedUrlsNftData, folderPath);
    const outputFile = path.join(folderPath, '/upload.json').replace(/\\/gm, '/');
    const finalData: UploadOutput = {
        collectionName: config.collectionName,
        hashes: fileHashData,
        urls: UrlMapper.get(),
        environment: { env: config.environment, ...env },
    };

    ReportGenerator.add(`Writing final file: ${outputFile}`, true);
    fs.writeFileSync(outputFile, JSON.stringify(finalData, null, 2));

    const exitMessage = `Finished Processing. Press [Enter] to Exit`;
    ReportGenerator.add(exitMessage, false);
    await promptUser(exitMessage);
};

main();
