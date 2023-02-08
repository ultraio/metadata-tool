import path from 'path';
import { CSVParser } from '../src/utils/csvParser';
import { buildHashes } from '../src/utils/integrityBuilder';
import { NFTData } from '../src/types';

const testPath = './test/csv';
const imgHash = '59c26867c8075c400100173d4d75751aaa3f0af78820ef9656ab4c87567f811e';
const tacoHash = 'db246aaf2a7acdc7dd70f902e4b6c642fe94a1f23823024f9c67c657d9878939';

let data: NFTData;
let hashedData: NFTData;

describe('integrity builder test', () => {
    test('should build integrity for StaticResource types', async () => {
        const actualPath = path.join(process.cwd(), testPath).replace(/\\/gm, '/');
        data = await CSVParser.parse(actualPath);
        hashedData = await buildHashes<NFTData>(data, actualPath);
    });

    test('verify defaultToken has media data', () => {
        expect(hashedData.defaultToken?.media.hero?.integrity !== null).toBe(true);
        expect(hashedData.defaultToken?.media.product?.integrity !== null).toBe(true);
        expect(hashedData.defaultToken?.media.hero?.integrity?.hash).toBe(imgHash);
        expect(hashedData.defaultToken?.media.product.integrity?.hash).toBe(imgHash);
    });

    test('verify factory has media data', () => {
        expect(hashedData.factory?.media.hero?.integrity !== null).toBe(true);
        expect(hashedData.factory?.media.product?.integrity !== null).toBe(true);
        expect(hashedData.factory?.media.hero?.integrity?.hash).toBe(imgHash);
        expect(hashedData.factory?.media.product.integrity?.hash).toBe(imgHash);

        if (hashedData.factory.media.gallery) {
            for (let i = 0; i < hashedData.factory.media.gallery?.length; i++) {
                const staticResource = hashedData.factory.media.gallery[i];
                expect(staticResource?.integrity?.hash).toBe(tacoHash);
            }
        }
    });

    test('verify tokens have media data', () => {
        expect(hashedData.tokens.length >= 1).toBe(true);
        for (let i = 0; i < hashedData.tokens.length; i++) {
            expect(hashedData.tokens[i].media.hero?.integrity !== null).toBe(true);
            expect(hashedData.tokens[i].media.product?.integrity !== null).toBe(true);
            expect(hashedData.tokens[i].media.hero?.integrity?.hash).toBe(imgHash);
            expect(hashedData.tokens[i].media.product.integrity?.hash).toBe(imgHash);
        }
    });
});
