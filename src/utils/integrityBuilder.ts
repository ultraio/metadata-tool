import { StaticResource } from 'types';
import { HashGenerator } from './hashGenerator';

const StaticResourceKeys = ['integrity', 'uris', 'contentType'];

/**
 * Determines if the passed object has all the necessary property names.
 *
 * @param {Object} object
 * @param {string[]} keys
 * @return {*}
 */
function objectHasKeys(object: Object, keys: string[]) {
    for (let key of keys) {
        if (!object.hasOwnProperty(key)) {
            return false;
        }
    }

    return true;
}

/**
 * Walk through a given object, and build integrity for all StaticResource objects.
 *
 * @export
 * @template T
 * @param {Object} data
 * @param {string} workingDirectory
 * @return {Promise<T>}
 */
export async function buildHashes<T>(data: Object, workingDirectory: string): Promise<T> {
    // Finds Static Resource Objects & Creates Hashes
    if (objectHasKeys(data, StaticResourceKeys)) {
        const typedData = <StaticResource>data;
        if (typedData.integrity !== null) {
            return typedData as T;
        }

        if (typedData.uris.length <= 0) {
            return typedData as T;
        }

        let contentHashes = '';
        for (let i = 0; i < typedData.uris.length; i++) {
            const newHash = await HashGenerator.create(typedData.uris[i], workingDirectory);
            if (typeof newHash === 'undefined') {
                return typedData as T;
            }

            contentHashes += newHash;
        }

        typedData.integrity = {
            type: 'SHA256',
            hash: HashGenerator.fromString(contentHashes),
        };

        return typedData as T;
    }

    // Walks through objects until it finds an object to nest into.
    // Walks through an arrays and tries to find StaticResource as well.
    const keys = Object.keys(data);
    for (let key of keys) {
        if (typeof data[key] !== 'object' || !data[key]) {
            continue;
        }

        if (!Array.isArray(data[key])) {
            data[key] = await buildHashes<T>(data[key], workingDirectory);
            continue;
        }

        for (let i = 0; i < data[key].length; i++) {
            data[key][i] = await buildHashes<T>(data[key][i], workingDirectory);
        }
    }

    return data as T;
}
