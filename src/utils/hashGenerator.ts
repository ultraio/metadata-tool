import fs from 'fs';
import path from 'path';
import crossFetch from 'cross-fetch';
import * as sjcl from 'sjcl';

import { ErrorGenerator } from './errorGenerator';
import { ReportGenerator } from './reportGenerator';

const Internal = {
    /**
     * Verify that a URL is in a valid format.
     *
     * @param {string} url
     * @return {boolean}
     */
    isValidUrl(url: string): boolean {
        if (!url.includes('http') || !url.includes('https')) {
            return false;
        }

        try {
            new URL(url);
            return true;
        } catch (err) {
            return false;
        }
    },
    /**
     * Get external file content as an array buffer.
     *
     * @param {string} url
     * @return {(Promise<ArrayBuffer | undefined>)}
     */
    async getExternalFileContent(url: string): Promise<ArrayBuffer | undefined> {
        const response = await crossFetch(url);
        if (!response.ok) {
            return undefined;
        }

        return await response.arrayBuffer();
    },
    /**
     * Get the current file content of a given file based on a relative path and working directory.
     *
     * @param {string} filePath
     * @param {string} workingDirectory
     * @return {(ArrayBuffer | undefined)}
     */
    getFileContent(filePath: string, workingDirectory: string): ArrayBuffer | undefined {
        const fullPath = path.join(workingDirectory, filePath).replace(/\\/gm, '/');
        if (!fs.existsSync(fullPath)) {
            return undefined;
        }

        const data = Buffer.from(fs.readFileSync(fullPath));
        return data;
    },
};

export const HashGenerator = {
    /**
     * Hash a string of data into a persistent SHA256 hash.
     *
     * @param  {string} data
     * @returns {string}
     */
    sha256(data: string): string {
        const hashBits = sjcl.hash.sha256.hash(data);
        return sjcl.codec.hex.fromBits(hashBits);
    },
    /**
     * Obtain a hash for given file contents.
     *
     * @param {string} urlOrPath
     * @return {(Promise<string | undefined>)}
     */
    async get(urlOrPath: string, workingDirectory): Promise<string | undefined> {
        let data: ArrayBuffer | undefined;

        if (Internal.isValidUrl(urlOrPath)) {
            data = await Internal.getExternalFileContent(urlOrPath);
        } else {
            data = Internal.getFileContent(urlOrPath, workingDirectory);
        }

        if (typeof data === 'undefined') {
            ReportGenerator.add(ErrorGenerator.get('UNREACHABLE_FILE', urlOrPath));
            return undefined;
        }

        const hexBufferAsString = Buffer.from(data).toString('hex');
        return HashGenerator.sha256(hexBufferAsString);
    },
};
