import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { createHash } from 'crypto';

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
     * @return {(Promise<string | undefined>)}
     */
    async getExternalFileContent(url: string): Promise<string | undefined> {
        const response = await fetch(url);
        if (!response.ok) {
            return undefined;
        }

        const hash = createHash('sha256', { encoding: 'hex' });
        response.body.pipe(hash);

        await new Promise((resolve: Function) => {
            response.body.on('end', () => {
                resolve();
            });
        });

        return hash.read();
    },
    /**
     * Get the current file content of a given file based on a relative path and working directory.
     *
     * @param {string} filePath
     * @param {string} workingDirectory
     * @return {(Buffer | undefined)}
     */
    async getFileContent(
        filePath: string,
        workingDirectory: string | undefined = undefined
    ): Promise<string | undefined> {
        let fullPath = filePath;
        if (typeof workingDirectory === 'string') {
            fullPath = path.join(workingDirectory, filePath).replace(/\\/gm, '/');
        }

        if (!fs.existsSync(fullPath)) {
            return undefined;
        }

        const stream = fs.createReadStream(fullPath);
        const hash = createHash('sha256', { encoding: 'hex' });
        stream.pipe(hash);

        await new Promise((resolve: Function) => {
            stream.on('end', () => {
                resolve();
            });
        });

        return hash.read();
    },
};

export const HashGenerator = {
    /**
     * Create a hash based on relative file paths.
     * The urlOrPath can be a full directory path if workingDirectory is set to undefined.
     *
     * @param {string} urlOrPath
     * @param {*} [workingDirectory=undefined]
     * @return {(Promise<string | undefined>)}
     */
    async create(urlOrPath: string, workingDirectory: string | undefined = undefined): Promise<string | undefined> {
        let result: string | undefined;

        if (Internal.isValidUrl(urlOrPath)) {
            result = await Internal.getExternalFileContent(urlOrPath);
        } else {
            result = await Internal.getFileContent(urlOrPath, workingDirectory);
        }

        if (typeof result === 'undefined') {
            ReportGenerator.add(ErrorGenerator.get('UNREACHABLE_FILE', urlOrPath));
            return undefined;
        }

        return result;
    },
    /**
     * Generates a sha256 from a string
     *
     * @param {string} data
     * @return {string}
     */
    fromString(data: string): string {
        return createHash('sha256', { encoding: 'hex' }).update(data).digest('hex');
    },
};
