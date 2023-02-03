import ajv from 'ajv';

import { FactorySchema } from '../schemas/factory';
import { TokenSchema } from '../schemas/token';
import { ReportGenerator } from './reportGenerator';

const ajvInstance = new ajv({ allowUnionTypes: true });
const SchemaBindings = {
    factory: FactorySchema,
    token: TokenSchema,
    defaultToken: TokenSchema,
};

/**
 * Takes a file object, or json string and validates the contents against a JSON schema.
 * Errors will be printed to console if invalid.
 *
 * @export
 * @param {('factory' | 'token')} type
 * @param {(Object | string)} data
 * @return {boolean}
 */
function validate(type: keyof typeof SchemaBindings, data: Object | string, hideErrors = false): boolean {
    if (typeof SchemaBindings[type] === 'undefined') {
        throw new Error(`File type ${type} cannot be validated.`);
    }

    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch (err) {
            throw new Error(`Could not successfully convert JSON schema to object.`);
        }
    }

    const validator = ajvInstance.compile(SchemaBindings[type]);
    const isValid = validator(data);

    if (!isValid && !hideErrors && validator.errors) {
        for (let i = 0; i < validator.errors?.length; i++) {
            // ! - Errors are a bit vague sometimes; might need some training to read.
            // ! - Unless we decide to parse them further and provide simple responses.
            ReportGenerator.add(JSON.stringify(validator.errors[i]));
        }
    }

    return isValid;
}

export const SchemaValidator = {
    validate,
};
