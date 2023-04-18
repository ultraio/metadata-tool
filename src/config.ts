import { Environment } from './types';

const evnUrls = {
    dev: 'https://static.dev.ultra.io/uniq/original',
    qa: 'https://static.qa.ultra.io/uniq/original',
    staging: 'https://static.staging.ultra.io/uniq/original',
    prod: 'https://static.ultra.io/uniq/origial',
    custom: '',
};

export interface Config {
    collectionName?: string | undefined;
    environment?: Environment | undefined;
}

/**
 * This function returns the URL of a given environment.
 * @param {Environment} env - The env to get the url for
 */
export function getEnvironmentUrl(env: Environment): string {
    return evnUrls[env];
}

/**
 * It sets the url for custom environment
 * @param {string} url
 */
export function setCustomEnvironmentUrl(url: string) {
    evnUrls.custom = url;
}
