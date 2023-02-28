import { Environment } from './types';

const evnBuckets = {
    dev: 'ultraio-uniq-dev',
    qa: 'ultraio-uniq-qa',
    staging: 'ultraio-uniq-staging',
    prod: 'ultraio-uniq-prod',
    custom: '',
};

const evnUrls = {
    dev: 'https://static.dev.ultra.io/uniq/original',
    qa: 'https://static.qa.ultra.io/uniq/original',
    staging: 'https://static.staging.ultra.io/uniq/original',
    prod: 'https://static.ultra.io/uniq/origial',
    custom: '',
};

// Mapping for envs to the s3/wasabi bucket endpoint - since the envUrls are a "redirect" to the actual endpoint.
// But we can't use the envUrls to upload data to the bucket. For that we'd need the bucket endpoint.
const envEndpointMappings = {
    dev: 's3.us-east-1.wasabisys.com',
    qa: 's3.us-east-1.wasabisys.com',
    staging: 's3.us-east-1.wasabisys.com',
    prod: 's3.us-east-1.wasabisys.com',
    custom: '',
};

export interface Config {
    collectionName?: string | undefined;
    environment?: Environment | undefined;
}

/**
 * It takes an environment and returns an object with the url and bucket for that environment
 * @param {Environment} env - The environment you want to get the url and bucket for.
 * @returns An object with two properties: url and bucket.
 */

/**
 * It takes an environment and returns an object with the url, endpoint, and bucket for that
 * environment
 * @param {Environment} env - Environment - this is the environment you want to get the parameters for.
 * @returns An object with three properties: url, endpoint and bucket.
 */
export function getEnvironment(env: Environment): { url: string; endpoint: string; bucket: string } {
    return { url: evnUrls[env], endpoint: envEndpointMappings[env], bucket: evnBuckets[env] };
}
/**
 * It sets the custom environment variables for the url and bucket name
 * @param {string} url - The URL of the Wasabi/S3 endpoint.
 * @param {string} bucketName - The name of the bucket you want to use.
 */

/**
 * It sets the url, endpoint and bucket for the custom environment
 * @param {string} url - The URL of the server/bucket.
 * @param {string} endpoint - The endpoint of the bucket.
 * @param {string} bucketName - The name of the bucket you want to use.
 */
export function setCustomEnvironment(url: string, endpoint: string, bucketName: string) {
    // Example 1: Using s3/wasabi bucket without any "redirect"/DNS
    // url: https://my-bucket.s3.amazonaws.com
    // endpoint: s3.amazonaws.com
    // bucket: my-bucket

    // Example 2: Using s3/wasabi bucket with custom domain name
    // url: https://my-custom-domain.com
    // endpoint: s3.amazonaws.com
    // bucket: my-custom-env
    evnUrls.custom = url;
    envEndpointMappings.custom = endpoint;
    evnBuckets.custom = bucketName;
}
