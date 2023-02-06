import { HashGenerator } from '../src/utils/hashGenerator';

const externalFileHash = '4dfe534d3a87f23d1b488bbe186a73f9a54ca8238c749faa7977057841a5ea68';
const externalVideoFileHash = '8f6ccbaf1e3ad87e4f5f2467bc59dce30c3d6d84d2755bca8667f76fa3189f51';

let hash1: string;
let hash2: string;

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

    test('should read external video file and return hash', async () => {
        const resultHash = await HashGenerator.get('https://zippy.gfycat.com/BlaringFaithfulFulmar.mp4', undefined);
        expect(resultHash).toBe(externalVideoFileHash);

        if (typeof resultHash === 'string') {
            hash2 = resultHash;
        }
    });

    test('should read internal video file and return hash', async () => {
        const resultHash = await HashGenerator.get('./test/data/images/cat-typing.mp4', process.cwd());
        expect(resultHash).toBe(hash2);
    });
});
