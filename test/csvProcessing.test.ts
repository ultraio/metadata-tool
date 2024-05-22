import fs from 'fs';
import path from 'path';
import { NFTData } from '../src/types';

import { CSVParser } from '../src/utils/csvParser';

const testPath = './test/csv';
const factoryPath = `${testPath}/factory.csv`;
const tokensPath = `${testPath}/tokens.csv`;

const factoryCSV = fs.readFileSync(factoryPath);
const tokensCSV = fs.readFileSync(tokensPath);

function hasValue(value: any) {
    expect(typeof value !== 'undefined').toBe(true);
    expect(value !== null).toBe(true);
}

let data: NFTData;

describe('csv processing test', () => {
    test('factory should have read from file', () => {
        hasValue(factoryCSV);
    });

    test('tokens should have read from file', () => {
        hasValue(tokensCSV);
    });

    test('should read both files successfully and convert to csv', async () => {
        const actualPath = path.join(process.cwd(), testPath).replace(/\\/gm, '/');
        data = await CSVParser.parse(actualPath);
        expect(typeof data !== 'undefined').toBe(true);
    });

    test('validate factory data', () => {
        expect(typeof data.factory !== 'undefined').toBe(true);
        expect(typeof data.factory.defaultLocale).toBe('string');
        expect(typeof data.factory.attributes).toBe('object');
        expect(data.factory.media.product.integrity).toBeTruthy();
        expect(data.factory.media.product.integrity?.hash).toBe(
            '7cfe7bb3fc62c0ba4706ec1a2f78b3c8845c2985aa99bdefebae8fe18ea835e5'
        );
    });

    test('validate default token data', () => {
        expect(typeof data.defaultToken !== 'undefined').toBe(true);
        if (typeof data.defaultToken !== 'undefined') {
            expect(typeof data.defaultToken.name).toBe('string');
            expect(typeof data.defaultToken.defaultLocale).toBe('string');
            expect(typeof data.defaultToken.attributes).toBe('object');
            expect(data.defaultToken.media.product.integrity).toBeTruthy();
            expect(data.defaultToken.media.product.integrity?.hash).toBe(
                '7cfe7bb3fc62c0ba4706ec1a2f78b3c8845c2985aa99bdefebae8fe18ea835e5'
            );
        }
    });

    test('validate tokens data', () => {
        expect(typeof data.tokens !== 'undefined').toBe(true);
        expect(Array.isArray(data.tokens)).toBe(true);
        expect(data.tokens.length >= 3).toBe(true);

        for (let i = 0; i < data.tokens.length; i++) {
            expect(data.tokens[i].serialNumber).toBe(String(i + 1));
            expect(data.tokens[i].media.product.integrity).toBeTruthy();
            expect(data.tokens[i].media.product.integrity?.hash).toBe(
                '7cfe7bb3fc62c0ba4706ec1a2f78b3c8845c2985aa99bdefebae8fe18ea835e5'
            );
        }
    });
});
