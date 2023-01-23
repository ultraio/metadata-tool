import { Environment } from './types';

const evnUrls = {
    dev: 'https://static.dev.ultra.io',
    qa: 'https://static.qa.ultra.io',
    staging: 'https://static.staging.ultra.io',
    prod: 'https://static.ultra.io',
    custom: '',
};

export interface Config {
    collectionName?: string | undefined;
    environment?: Environment | undefined;
}

export function getEnvironmentUrl(env: Environment): string {
    return evnUrls[env];
}

export function setCustomEnvUrl(url: string) {
    evnUrls.custom = url;
}
