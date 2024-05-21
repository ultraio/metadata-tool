import fs from 'fs';
import path from 'path';
import { ReportGenerator } from './utils/reportGenerator';

// List of all available envs and their corresponding url
let envUrlMapping = {};

export const DEFAULT_GENERATED_MEDIA_DIR = 'generated_media';

export interface Config {
    environment: string | undefined; // Current env
    environmentUrl: string | undefined; // Current env url
    collectionName: string | undefined;
    generatedMediaDir: string; // Path to generated media files
}

let defaultConfig: Config | undefined = undefined;

export function getConfig(): Config | undefined {
    if (defaultConfig) {
        return defaultConfig;
    }

    // cwd fix for pkg - can't use process.cwd() in packaged binary/executable
    const basePath = process.env.ENV == 'DEV' ? process.cwd() : path.dirname(process.execPath);

    // If config is not provided, will ask for env details from user
    if (!fs.existsSync(path.join(basePath, 'config.json'))) {
        ReportGenerator.add(`Missing config file. Will prompt user for env.`, false);
        return undefined;
    }

    const configJson = fs.readFileSync(path.join(basePath, 'config.json'), { encoding: 'utf-8' });
    const config = JSON.parse(configJson);

    // If config is not valid, will ask for env details from user
    if (!config || Object.keys(config).length === 0) {
        ReportGenerator.add(`Invalid config file. Will prompt user for env.`, false);
        return undefined;
    }

    defaultConfig = {
        environment: undefined,
        environmentUrl: undefined,
        collectionName: undefined,
        generatedMediaDir: DEFAULT_GENERATED_MEDIA_DIR,
    };

    // Load all envs from config.json
    Object.assign(envUrlMapping, config);

    // If only one env is listed in the config, select it by default
    if (Object.keys(envUrlMapping).length === 1) {
        defaultConfig.environment = Object.keys(envUrlMapping)[0];
        defaultConfig.environmentUrl = config[defaultConfig.environment];
    }

    return defaultConfig;
}

export function getEnvs() {
    return envUrlMapping;
}
