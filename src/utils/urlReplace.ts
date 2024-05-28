import fs from 'fs';
import path from 'path';
import { Config } from 'config';
import { StaticResource } from '../types';
import { UrlMapper } from './urlMapper';
/**
 * Walk through a given object, replacing all URLs with the corresponding S3/Wasabi/Hosting service URLs.
 *
 * @export
 * @template T
 * @param {Object} data
 * @param {string} workingDirectory
 * @return {Promise<T>}
 */
export async function replaceUrls<T>(data: Object, workingDirectory: string, config: Config): Promise<T> {
    // Perform replacement, return result
    if (data.hasOwnProperty('uris')) {
        const typedData = <StaticResource>data;
        for (let i = 0; i < typedData.uris.length; i++) {
            if (typedData.uris[i].includes('http') || typedData.uris[i].includes('https')) {
                continue;
            }

            if (!typedData.integrity?.hash) {
                throw new Error(`Integrity hash not found for ${typedData.uris[i]}`);
            }

            const filePath = path.join(workingDirectory, typedData.uris[i]).replace(/\\/gm, '/');
            const splitString = typedData.uris[i].split('.');
            const extension = splitString[splitString.length - 1];
            const finalURL = `${config.environmentUrl}/${encodeURIComponent(
                config.collectionName!.replace(/\s/g, '')
            )}/${typedData.integrity.hash}.${extension}`
                // To remove any query params (if they exist on any external urls) from the output url (output url in this case is the url of S3/Wasabi buckets)
                // This will fix, for eg:
                // input url ---> https://www.somewebsite.com/5000.jpg?width=1200&quality=85&auto=format&fit=max&token=0c4de651644de5fe939d8dbd6b14ba66
                // output url ---> https://my-custom-env.s3.amazonaws.com/CollectionName/<file-hash>.jpg
                .split('?')[0];

            // We need to rename each media file to its hash value.
            // For example, if the file is 5000.jpg, we need to rename it to <hash>.jpg
            // But we're not going to rename the original file, well just copy it to the new file name.
            const newFilePath = path
                .join(workingDirectory, config.generatedMediaDir, typedData.integrity.hash + '.' + extension)
                .replace(/\\/gm, '/');
            fs.copyFileSync(filePath, newFilePath);

            UrlMapper.set(path.join(config.generatedMediaDir, path.basename(newFilePath)), finalURL);
            typedData.uris[i] = finalURL;
        }

        return typedData as T;
    }

    const keys = Object.keys(data);
    for (let key of keys) {
        if (typeof data[key] !== 'object' || !data[key]) {
            continue;
        }

        if (!Array.isArray(data[key])) {
            data[key] = await replaceUrls<T>(data[key], workingDirectory, config);
            continue;
        }

        for (let i = 0; i < data[key].length; i++) {
            data[key][i] = await replaceUrls<T>(data[key][i], workingDirectory, config);
        }
    }

    return data as T;
}
