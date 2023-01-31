import { SchemaValidator } from '../src/utils/schemaValidator';
import { FactoryMetaExample } from './data/factoryMetaExample';
import { TokenMetaExample } from './data/tokenMetaExample';

describe('schema validation tests', () => {
    test('factory - should validate correctly', () => {
        const result = SchemaValidator.validate('factory', FactoryMetaExample);
        expect(result).toBe(true);
    });

    test('factory - should not support additional properties', () => {
        const factoryClone = { ...FactoryMetaExample };
        factoryClone['testing'] = 'going to break it now';
        const result = SchemaValidator.validate('factory', factoryClone, true);
        expect(result).toBe(false);
    });

    test('token - should validate correctly', () => {
        const result = SchemaValidator.validate('token', TokenMetaExample);
        expect(result).toBe(true);
    });

    test('token - should not support additional properties', () => {
        const tokenClone = { ...TokenMetaExample };
        tokenClone['testing'] = 'going to break it now';
        const result = SchemaValidator.validate('token', tokenClone, true);
        expect(result).toBe(false);
    });
});
