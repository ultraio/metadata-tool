import path from 'path';
import fs from 'fs';
import { glob as globMod } from 'glob';
import { promisify } from 'util';
import { FactoryMetaData, NFTData, TokenMetaData } from 'types';

const glob = promisify(globMod);

export const JSONParser = {
    /**
     * It loads the `factory.json`, `defaultToken.json` and all the `*.json` files in the `/tokens` folder,
     * and returns them as a NFTData object
     * @param {string} folderPath - The path to the folder containing the NFT data.
     * @returns An object of type NFTData
     */
    async parse(folderPath: string): Promise<NFTData> {
        // Load factory.json
        const factoryJson = fs.readFileSync(path.join(folderPath, 'factory.json'), { encoding: 'utf-8' });
        const factory = JSON.parse(factoryJson) as FactoryMetaData;

        // Load defaultToken.json
        const defaultTokenJson = fs.readFileSync(path.join(folderPath, 'defaultToken.json'), { encoding: 'utf-8' });
        const defaultToken = JSON.parse(defaultTokenJson) as TokenMetaData;

        // Load tokens 'x.token.json'
        let tokens: Array<TokenMetaData> = [];

        const files = await glob(path.join(folderPath, `*.token.json`));
        for (let filePath of files) {
            const tokenJson = fs.readFileSync(filePath, { encoding: 'utf-8' });
            const token = JSON.parse(tokenJson) as TokenMetaData;
            tokens.push(token);
        }

        return {
            factory,
            defaultToken,
            tokens,
        };
    },
};
