import { HashGenerator } from '../src/utils/hashGenerator';

const externalFileHash = '803789d5bd6544c0158934f9419506e183d2ad29c38602db39a7c2b8f8bf479b';

let hash1: string;

describe('hash generator test', () => {
    test('should read external file and return hash', async () => {
        const resultHash = await HashGenerator.create(
            'https://developers.ultra.io/images/home/splash_gamedevelopers.png',
            undefined
        );
        expect(resultHash).toBe(externalFileHash);

        if (typeof resultHash === 'string') {
            hash1 = resultHash;
        }
    });

    test('should read internal file and return hash', async () => {
        const resultHash = await HashGenerator.create('./test/data/images/ultra-image.png', process.cwd());
        expect(resultHash).toBe(hash1);
    });
});
