import path from 'path';
import { glob as globMod } from 'glob';
import { promisify } from 'util';
import { FactoryMetaData, NFTData, TokenMetaData } from 'types';
const glob = promisify(globMod);

export class JSONParser {
    /**
     * It loads the `factory.json`, `defaultToken.json` and all the `*.json` files in the `/tokens` folder,
     * and returns them as a NFTData object
     * @param {string} folderPath - The path to the folder containing the NFT data.
     * @returns An object of type NFTData
     */
    async parse(folderPath: string): Promise<NFTData> {
        // Load factory.json
        const factoryJson = require(path.join(folderPath, 'factory.json')) as FactoryMetaData;

        // Load defaultToken.json
        const defaultTokenJson = require(path.join(folderPath, 'defaultToken.json')) as TokenMetaData;

        // Load specific token files (/tokens/1.json, /tokens/2.json, /tokens/<hash>.json etc)
        const tokensJson = (
            await glob(path.join(folderPath, 'tokens', `*.json`), {
                windowsPathsNoEscape: true,
            })
        ).map((f) => {
            return require(f) as TokenMetaData;
        });

        return {
            factory: factoryJson,
            defaultToken: defaultTokenJson,
            tokens: tokensJson,
        };
    }
}
