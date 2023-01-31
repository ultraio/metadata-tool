import ajv from 'ajv';

import { FactorySchema } from 'schemas/factory';
import { TokenSchema } from 'schemas/token';

const ajvInstance = new ajv();
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
function validate(type: keyof typeof SchemaBindings, data: Object | string): boolean {
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

    if (!isValid) {
        console.log(validator.errors);
    }

    return isValid;
}

export const SchemaValidator = {
    validate,
};
