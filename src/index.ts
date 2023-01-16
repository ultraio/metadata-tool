import { glob as globMod } from 'glob';
import { promptUser, sleep } from './utils';
import path from 'path';
import { promisify } from 'util';
const glob = promisify(globMod);

const main = async () => {
    // Ideally we should ask user if they want to provide .json or .csv file beforehand. We can use something like inquirer module to provide the user with selectable options to choose from .json or .csv
    // and then we'll know exactly which files to look for: factory.json etc or factory.csv etc
    const folderPath = process.argv[2];

    if (!folderPath) {
        await promptUser('Invalid folder path!');
        return;
    }

    console.log(`Processing directory: ${folderPath}`);

    const files = (
        await glob(path.join(folderPath, '+(factory.+(json|csv)|defaultToken.+(json|csv)|tokens.+(json|csv))'))
    ).map((f) => {
        return path.basename(f);
    });

    if (!files || files.length == 0) {
        await promptUser(
            'Required factory.json/csv and defaultToken.json/csv files not found. Please make sure the files exists in the provided directory!'
        );
        return;
    }

    console.log(files);

    if (files.includes('tokens.csv') || files.includes('tokens.json')) {
        console.log('tokens.csv | tokens.json file was also found in the provided directory.');
    }

    // TODO: future tickets: process files here

    await promptUser('Finished processing..');
};

main();
