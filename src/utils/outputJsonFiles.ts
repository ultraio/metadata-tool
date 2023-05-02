import fs from 'fs';
import path from 'path';
import { NFTData } from '../types';
import { FileHashes, SerialHash } from '../types/uploadOutput';
import { ErrorGenerator } from './errorGenerator';
import { HashGenerator } from './hashGenerator';
import { ReportGenerator } from './reportGenerator';

function normalizeUrl(url: string) {
    return url.replace(/\\/gm, '/');
}

/**
 * Takes NFT Data, and writes to file.
 * After writing to file it re-reads the file to obtain a sha256 hash.
 * sha256 hash is generated and returned as an object.
 *
 * @export
 * @param {NFTData} data
 * @param {string} workingDirectory
 * @return {Promise<FileHashes>}
 */
export async function outputJsonFiles(data: NFTData, workingDirectory: string): Promise<FileHashes> {
    const paths = {
        defaultToken: normalizeUrl(path.join(workingDirectory, '/defaultToken.json')),
        factory: normalizeUrl(path.join(workingDirectory, '/factory.json')),
    };

    if (data.defaultToken) {
        ReportGenerator.add(`Writing defaultToken.json to file.`);
        fs.writeFileSync(paths.defaultToken, JSON.stringify(data.defaultToken, null, 2));
    }

    ReportGenerator.add(`Writing factory.json to file.`);
    fs.writeFileSync(paths.factory, JSON.stringify({ ...data.factory, tokenUriTemplate: undefined }, null, 2));

    let defaultTokenFileHash: string | undefined = undefined;
    if (data.defaultToken) {
        defaultTokenFileHash = await HashGenerator.create(paths.defaultToken);
        if (typeof defaultTokenFileHash === 'undefined') {
            ReportGenerator.add(ErrorGenerator.get('HASH_FOR_FILE_FAILED', paths.defaultToken), true);
            process.exit(1);
        }
    }

    const factoryFileHash = await HashGenerator.create(paths.factory);
    if (typeof factoryFileHash === 'undefined') {
        ReportGenerator.add(ErrorGenerator.get('HASH_FOR_FILE_FAILED', paths.factory), true);
        process.exit(1);
    }

    const tokens: Array<SerialHash> = [];

    for (let token of data.tokens) {
        const tokenPath = normalizeUrl(path.join(workingDirectory, `/${token.serialNumber}.token.json`));

        ReportGenerator.add(`Writing ${token.serialNumber}.token.json to file.`);
        fs.writeFileSync(tokenPath, JSON.stringify(token, null, 2));

        const tokenHash = await HashGenerator.create(tokenPath);
        if (typeof tokenHash === 'undefined') {
            ReportGenerator.add(ErrorGenerator.get('HASH_FOR_FILE_FAILED', tokenPath), true);
            process.exit(1);
        }

        tokens.push({ serialNumber: token.serialNumber, hash: tokenHash });
    }

    return {
        defaultToken: defaultTokenFileHash,
        factory: factoryFileHash,
        tokens,
    };
}
