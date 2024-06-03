import fs from 'fs';
import path from 'path';
import { NFTData } from '../types';
import { SerialHashUrl, HashUrl } from '../types/uploadOutput';
import { ErrorGenerator } from './errorGenerator';
import { HashGenerator } from './hashGenerator';
import { ReportGenerator } from './reportGenerator';
import { Config } from 'config';

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
 */
export async function outputJsonFiles(
    data: NFTData,
    workingDirectory: string,
    config: Config
): Promise<{
    factory: HashUrl;
    defaultToken: HashUrl | undefined;
    tokens: Array<SerialHashUrl>;
}> {
    const paths = {
        defaultToken: normalizeUrl(path.join(workingDirectory, '/defaultToken.json')),
        factory: normalizeUrl(path.join(workingDirectory, '/factory.json')),
    };

    if (data.defaultToken) {
        // Don't include defaultToken.serialNumber when writing to file
        ReportGenerator.add(`Writing default token to file.`);
        fs.writeFileSync(
            paths.defaultToken,
            JSON.stringify({ ...data.defaultToken, serialNumber: undefined }, null, 2)
        );
    }

    // Don't include factory.tokenUriTemplate when writing to file
    ReportGenerator.add(`Writing factory to file.`);
    fs.writeFileSync(paths.factory, JSON.stringify({ ...data.factory, tokenUriTemplate: undefined }, null, 2));

    let defaultToken: HashUrl | undefined = undefined;
    if (data.defaultToken) {
        const defaultTokenHash = await HashGenerator.create(paths.defaultToken);
        if (typeof defaultTokenHash === 'undefined') {
            ReportGenerator.add(ErrorGenerator.get('HASH_FOR_FILE_FAILED', paths.defaultToken), true);
            process.exit(1);
        }

        const defaultTokenFileName =
            (data.factory.tokenUriTemplate == '{serial_number}' ? '{serial_number}' : defaultTokenHash) + '.json';
        const defaultTokenUrl =
            config.environmentUrl +
            '/' +
            encodeURIComponent(config.collectionName!.replace(/\s/g, '')) +
            '/' +
            defaultTokenFileName;

        defaultToken = {
            hash: defaultTokenHash,
            url: defaultTokenUrl,
        };

        // Rename "defaultToken.json" to defaultTokenFileName
        fs.renameSync(paths.defaultToken, normalizeUrl(path.join(workingDirectory, `/${defaultTokenFileName}`)));
    }

    const factoryHash = await HashGenerator.create(paths.factory);
    if (typeof factoryHash === 'undefined') {
        ReportGenerator.add(ErrorGenerator.get('HASH_FOR_FILE_FAILED', paths.factory), true);
        process.exit(1);
    }

    const factoryFileName = factoryHash + '.json';
    const factory: HashUrl = {
        hash: factoryHash,
        url:
            config.environmentUrl +
            '/' +
            encodeURIComponent(config.collectionName!.replace(/\s/g, '')) +
            '/' +
            factoryFileName,
    };

    // Rename "factory.json" to factoryFileName
    fs.renameSync(paths.factory, normalizeUrl(path.join(workingDirectory, `/${factoryFileName}`)));

    const tokens: Array<SerialHashUrl> = [];

    for (let token of data.tokens) {
        const tokenPath = normalizeUrl(path.join(workingDirectory, `/${token.serialNumber}.json`));

        // Don't include token.serialNumber when writing to file
        ReportGenerator.add(`Writing token ${token.serialNumber} to file.`);
        fs.writeFileSync(tokenPath, JSON.stringify({ ...token, serialNumber: undefined }, null, 2));

        const tokenHash = await HashGenerator.create(tokenPath);
        if (typeof tokenHash === 'undefined') {
            ReportGenerator.add(ErrorGenerator.get('HASH_FOR_FILE_FAILED', tokenPath), true);
            process.exit(1);
        }

        const tokenFileName =
            (data.factory.tokenUriTemplate == '{serial_number}' ? token.serialNumber : tokenHash) + '.json';
        const tokenUrl =
            config.environmentUrl +
            '/' +
            encodeURIComponent(config.collectionName!.replace(/\s/g, '')) +
            '/' +
            tokenFileName;

        tokens.push({ serialNumber: token.serialNumber, hash: tokenHash, url: tokenUrl });

        if (data.factory.tokenUriTemplate == '{hash}') {
            // Rename `${token.serialNumber}.json` to tokenFileName
            fs.renameSync(tokenPath, normalizeUrl(path.join(workingDirectory, `/${tokenFileName}`)));
        }
    }

    return {
        factory,
        defaultToken,
        tokens,
    };
}
