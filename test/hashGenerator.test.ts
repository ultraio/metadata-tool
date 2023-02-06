import fs from 'fs';
import { HashGenerator } from '../src/utils/hashGenerator';

const externalFileHash = '4dfe534d3a87f23d1b488bbe186a73f9a54ca8238c749faa7977057841a5ea68';

let hash1: string;

describe('hash generator test', () => {
    test('should read external file and return hash', async () => {
        const resultHash = await HashGenerator.get('https://i.imgur.com/zURagrP.jpeg', undefined);
        expect(resultHash).toBe(externalFileHash);
        if (typeof resultHash === 'string') {
            hash1 = resultHash;
        }
    });

    test('should read internal file and return hash', async () => {
        const resultHash = await HashGenerator.get('./test/data/images/cat.jpeg', process.cwd());
        expect(resultHash).toBe(hash1);
    });
});
