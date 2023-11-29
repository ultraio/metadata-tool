import { StaticResource } from '../types';
import { UrlMapper } from './urlMapper';

/**
 * Walk through a given object, and build integrity for all StaticResource objects.
 *
 * @export
 * @template T
 * @param {Object} data
 * @param {string} workingDirectory
 * @return {Promise<T>}
 */
export async function replaceUrls<T>(
    data: Object,
    workingDirectory: string,
    collectionName: string,
    environmentURL: string
): Promise<T> {
    // Perform replacement, return result
    if (data.hasOwnProperty('uris')) {
        const typedData = <StaticResource>data;
        for (let i = 0; i < typedData.uris.length; i++) {
            if (typedData.uris.includes('http') || typedData.uris.includes('https')) {
                continue;
            }

            const splitString = typedData.uris[i].split('.');
            const extension = splitString[splitString.length - 1];
            const finalURL = encodeURI(
                `${environmentURL}/${collectionName.replace(/\s/g, '')}/${typedData.integrity?.hash}.${extension}`
            )
                // To remove any query params (if they exist on any external urls) from the output url (output url in this case is the url of S3/Wasabi buckets)
                // This will fix, for eg:
                // input url ---> https://www.somewebsite.com/5000.jpg?width=1200&quality=85&auto=format&fit=max&token=0c4de651644de5fe939d8dbd6b14ba66
                // output url ---> https://my-custom-env.s3.amazonaws.com/CollectionName/<file-hash>.jpg
                .split('?')[0];

            UrlMapper.set(typedData.uris[i], finalURL);
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
            data[key] = await replaceUrls<T>(data[key], workingDirectory, collectionName, environmentURL);
            continue;
        }

        for (let i = 0; i < data[key].length; i++) {
            data[key][i] = await replaceUrls<T>(data[key][i], workingDirectory, collectionName, environmentURL);
        }
    }

    return data as T;
}
