import { glob as globMod } from 'glob';
import inquirer from 'inquirer';
import { promptUser, isValidUrl } from './utils';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { Config, getEnvironmentUrl, setCustomEnvUrl } from './config';
const glob = promisify(globMod);

const main = async () => {
    const config: Config = {};

    // Input file type (either .csv or .json)
    const { fileType } = await inquirer.prompt([
        {
            type: 'list',
            name: 'fileType',
            message: 'Select filetype to process: ',
            choices: ['json', 'csv'],
        },
    ]);

    // path is passed as cli argument or dragged-dropped into the binary
    let folderPath = process.argv[2];

    // validate folder path
    if (!fs.existsSync(folderPath)) {
        console.log(`Directory ${folderPath} does not exist!. Please provide a valid directory.`);

        ({ folderPath } = await inquirer.prompt([
            {
                type: 'input',
                name: 'folderPath',
                message: 'Enter directory path: ',
                validate(answer) {
                    return fs.existsSync(answer)
                        ? true
                        : `Directory ${answer} does not exist!. Please provide a valid directory.`;
                },
            },
        ]));
    }

    console.log(`Processing directory: ${folderPath}`);

    // Check if files exists on the given path
    const files = (
        await glob(path.join(folderPath, `+(factory.${fileType}|defaultToken.${fileType}|tokens.${fileType})`), {
            windowsPathsNoEscape: true,
        })
    ).map((f) => {
        return path.basename(f);
    });

    if (!files || files.length == 0) {
        await promptUser(
            `Required factory.${fileType} and defaultToken.${fileType} files not found. Please make sure the files exists in the provided directory!`
        );
        return;
    }
    console.log(files);

    if (files.includes(`tokens.${fileType}`)) {
        console.log(`tokens.${fileType} file was also found in the provided directory.`);
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
                return isValidUrl(answer) ? true : 'Please input a valid URL';
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
    await promptUser('Finished processing..');
};

main();
