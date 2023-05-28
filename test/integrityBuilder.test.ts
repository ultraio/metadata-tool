import path from 'path';
import { CSVParser } from '../src/utils/csvParser';
import { buildHashes } from '../src/utils/integrityBuilder';
import { NFTData } from '../src/types';

const testPath = './test/csv';
const imgHash = '595a1d87de162c7c92b14d1882ae6d842381e01d2f9b3361566dbefc2af2e1d2';
const tacoHash = '4a5fea9b26da3a2cc28062e5a900add545d3ea83229b9ad60124389f1459e8be';

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
