import path from 'path';
import { CSVParser } from '../src/utils/csvParser';
import { buildHashes } from '../src/utils/integrityBuilder';
import { NFTData } from '../src/types';
import { replaceUrls } from '../src/utils/urlReplace';

const testPath = './test/csv';
const folderPath = path.join(process.cwd(), testPath).replace(/\\/gm, '/');
const collectionName = 'testing';
const envUrl = 'https://whatever.com';

let data: NFTData;
let hashedData: NFTData;
let updatedUrlsNftData: NFTData;

describe('relative url repacement tests', () => {
    test('should build integrity first', async () => {
        data = await CSVParser.parse(folderPath);
        hashedData = await buildHashes<NFTData>(data, folderPath);
    });

    test('verify urls were converted based on collection name and env url', async () => {
        updatedUrlsNftData = await replaceUrls<NFTData>(hashedData, folderPath, collectionName, envUrl);
        expect(updatedUrlsNftData.defaultToken?.media.hero?.uris[0].includes(envUrl)).toBe(true);
        expect(updatedUrlsNftData.factory?.media.hero?.uris[0].includes(envUrl)).toBe(true);
        expect(updatedUrlsNftData.tokens[0]?.media.hero?.uris[0].includes(envUrl)).toBe(true);
    });

    test('verify hash from integrity is used in url', async () => {
        const defaultTokenIntegrity = updatedUrlsNftData.defaultToken?.media.hero?.integrity;
        expect(defaultTokenIntegrity !== null).toBe(true);
        if (defaultTokenIntegrity !== null && typeof defaultTokenIntegrity !== 'undefined') {
            expect(updatedUrlsNftData.defaultToken?.media.hero?.uris[0].includes(defaultTokenIntegrity.hash)).toBe(
                true
            );
        }

        const factoryIntegrity = updatedUrlsNftData.factory?.media.hero?.integrity;
        expect(factoryIntegrity !== null).toBe(true);
        if (factoryIntegrity !== null && typeof factoryIntegrity !== 'undefined') {
            expect(updatedUrlsNftData.factory?.media.hero?.uris[0].includes(factoryIntegrity.hash)).toBe(true);
        }

        const tokenIntegrity = updatedUrlsNftData.tokens[0]?.media.hero?.integrity;
        expect(tokenIntegrity !== null).toBe(true);
        if (tokenIntegrity !== null && typeof tokenIntegrity !== 'undefined') {
            expect(updatedUrlsNftData.tokens[0]?.media.hero?.uris[0].includes(tokenIntegrity.hash)).toBe(true);
        }
    });
});
