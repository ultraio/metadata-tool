import fs from 'fs';
import { parse as parseCsv } from 'csv-parse';
import { FactoryMetaData, StaticResource, TokenMetaData } from 'types';
import path from 'path';

/**
 * It takes a file path, reads the file, parses the CSV, and returns the records
 * @param {string} filePath - The path to the file you want to process.
 * @param {'factory' | 'token'} fileType - 'factory' | 'token'
 * @returns An array of objects.
 */
async function processFile(filePath: string, fileType: 'factory' | 'token') {
    const records: any[] = [];
    const parser = fs.createReadStream(filePath).pipe(
        parseCsv({
            delimiter: ',',
            columns: true,
            toLine: fileType == 'factory' ? 2 : undefined, // we only read the first data row from factory.csv
            onRecord: fileType == 'factory' ? prepareFactory : prepareTokens,
        })
    );
    for await (const record of parser) {
        records.push(record);
    }
    return records;
}

function prepareTokens(record: any): TokenMetaData {
    // TODO
    // console.log('parsing token');
    return { name: 'some-token-name' } as TokenMetaData;
}

/**
 * It takes a record from the CSV file and transforms it into a FactoryMetaData object
 * @param {any} record - the row of the CSV file
 * @returns An array of objects, each object is a factory
 */
function prepareFactory(record: any): FactoryMetaData {
    // console.log('parsing factory');
    // console.log(record);

    let factory = {} as FactoryMetaData;
    factory.specVersion = record['specVersion'];
    factory.type = record['type'];
    factory.name = record['name'];
    factory.subName = record['subName'];
    factory.description = record['description'];
    factory.author = record['author'];
    factory.defaultLocale = record['defaultLocale'];

    // TODO:
    // Hash generation is to be done in a future ticket: https://ultraio.atlassian.net/browse/BLOCK-927
    // Schema validation might fail without a hash though(?)
    // Parsing -> Hashing -> Validation instead of Parsing -> Validation -> Hashing
    factory.media = {
        product: {
            contentType: '',
            integrity: {
                hash: '',
                type: 'SHA256',
            },
            uris: [record['product']],
        },
        square: {
            contentType: '',
            integrity: {
                hash: '',
                type: 'SHA256',
            },
            uris: [record['square']],
        },
    };

    if (record['hero']) {
        factory.media.hero = {
            contentType: '',
            integrity: {
                hash: '',
                type: 'SHA256',
            },
            uris: [record['hero']],
        };
    }

    factory.media.gallery = [
        record['gallery 1'],
        record['gallery 2'],
        record['gallery 3'],
        record['gallery 4'],
        record['gallery 5'],
        record['gallery 6'],
        record['gallery 7'],
        record['gallery 8'],
        record['gallery 9'],
        record['gallery 10'],
        record['gallery 11'],
        record['gallery 12'],
    ].reduce(function (result: StaticResource[], element) {
        // if gallery N is not empty, i.e file path is provided, transform it to StaticResource type
        if (element) {
            result.push({
                contentType: '',
                integrity: {
                    hash: '',
                    type: 'SHA256',
                },
                uris: [element],
            });
        }
        return result;
    }, []);

    const tempAttributeList = [
        [record['Att Type 1'], record['Att Name 1'], record['Att Desc 1']],
        [record['Att Type 2'], record['Att Name 2'], record['Att Desc 2']],
        [record['Att Type 3'], record['Att Name 3'], record['Att Desc 3']],
        [record['Att Type 4'], record['Att Name 4'], record['Att Desc 4']],
        [record['Att Type 5'], record['Att Name 5'], record['Att Desc 5']],
        [record['Att Type 6'], record['Att Name 6'], record['Att Desc 6']],
        [record['Att Type 7'], record['Att Name 7'], record['Att Desc 7']],
        [record['Att Type 8'], record['Att Name 8'], record['Att Desc 8']],
        [record['Att Type 9'], record['Att Name 9'], record['Att Desc 9']],
        [record['Att Type 10'], record['Att Name 10'], record['Att Desc 10']],
        [record['Att Type 11'], record['Att Name 11'], record['Att Desc 12']],
        [record['Att Type 12'], record['Att Name 11'], record['Att Desc 12']],
    ]
        .filter((attribute) => {
            // to get rid of empty/null values
            return Boolean(attribute[0]);
        })
        .map((attribute) => {
            return {
                [attribute[1]]: {
                    name: attribute[1],
                    type: attribute[0],
                    description: attribute[2],
                },
            };
        });

    if (tempAttributeList.length) {
        factory.attributes = Object.assign({}, ...tempAttributeList);
    }
    return factory;
}

/**
 * It reads the factory and tokens CSV files, and returns an object with the factory and tokens data
 * @param {string} folderPath - The path to the folder containing the factory.csv and tokens.csv files.
 * @returns An object with the following properties:
 *     `factory: FactoryMetaData,
 *     defaultToken: TokenMetaData,
 *     tokens: TokenMetaData[]`
 */
async function parse(folderPath: string) {
    const factory: FactoryMetaData[] = await processFile(path.join(folderPath, 'factory.csv'), 'factory');
    const tokens: TokenMetaData[] = await processFile(path.join(folderPath, 'tokens.csv'), 'token');

    // console.log(factory);
    // console.log(tokens);
    // console.log(JSON.stringify(factory));

    return {
        factory: factory[0],
        defaultToken: tokens[0],
        tokens,
    };
}

export const CSVParser = {
    parse,
};
