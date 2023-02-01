import { glob as globMod } from 'glob';
import inquirer from 'inquirer';
import { promptUser, isValidUrl } from './utils';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { Config, getEnvironmentUrl, setCustomEnvUrl } from './config';
import { ErrorGenerator } from './utils/errorGenerator';
import { ReportGenerator } from './utils/reportGenerator';
import { ExitHandlers } from './utils/exitHandlers';

const glob = promisify(globMod);

const main = async () => {
    ExitHandlers.init();

    const config: Config = {};
    let fileType: 'csv' | 'json' = 'csv';
    let folderPath = process.argv[2]; // path is passed as cli argument or dragged-dropped into the binary

    // validate folder path
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

    ReportGenerator.add(`Processing directory: ${folderPath}`);

    // Check what file type to process; either csv or json
    const allFiles = (
        await glob(path.join(folderPath, `+(factory.+(json|csv)|defaultToken.+(json|csv)|tokens.+(json|csv))`), {
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

    // check if required files are present
    const files = fileType == 'csv' ? csvFiles : jsonFiles;
    if (!(files.includes(`factory.${fileType}`) && files.includes(`defaultToken.${fileType}`))) {
        const errorMessage = ErrorGenerator.get('MISSING_FACTORY_FILES', fileType, fileType);
        ReportGenerator.add(errorMessage);
        await promptUser(errorMessage);
        return;
    }

    // notify if tokens file is present
    if (files.includes(`tokens.${fileType}`)) {
        ReportGenerator.add(`tokens.${fileType} file was also found in the provided directory.`);
    }

    // Input collection name and environment for urls
    const { answer: collectionName } = await promptUser('Enter collection name:');
    config.collectionName = collectionName;

    const { envType, customUrl } = await inquirer.prompt([
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
    ]);

    config.environment = envType;
    if (envType == 'custom') {
        setCustomEnvUrl(customUrl);
    }

    // remove later - debugging only
    console.log(
        `Collection name: ${config.collectionName}, env: ${config.environment}, url: ${getEnvironmentUrl(
            config.environment!
        )}`
    );

    // TODO:  future tickets: process files here

    // TODO: File Validation
    // SchemaValidator.validate(..., ...);

    await promptUser('Finished processing..');
};

main();
