import fs from 'fs';
import path from 'path';
import { parse as parseCsv } from 'csv-parse';
import { FactoryMetaData, Metadata, NFTData, StaticResource, TokenMetaData } from 'types';
import { Config, getEnvironmentUrl } from 'config';

export class CSVParser {
    /**
     * It takes a directory path, reads the file, parses the CSV, and returns the records
     * @param {string} folderPath - The path to the file you want to process.
     * @param {'factory' | 'token'} fileType - `factory` | `tokens`
     * @returns An array of objects.
     */
    private processFile = async (folderPath: string, fileType: 'factory' | 'tokens') => {
        const records: any[] = [];
        const parser = fs.createReadStream(path.join(folderPath, `${fileType}.csv`)).pipe(
            parseCsv({
                delimiter: ',',
                columns: true,
                toLine: fileType == 'factory' ? 2 : undefined, // we only read the first data row from factory.csv
                onRecord: fileType == 'factory' ? this.prepareFactory : this.prepareToken,
            })
        );
        for await (const record of parser) {
            records.push(record);
        }
        return records;
    };

    /**
     * It takes a record from the CSV file and transforms it into a Metadata object
     * @param {any} record - The record object that is passed to the function.
     * @returns An object of type Metadata
     */
    private prepareMetadata = (record: any): Metadata => {
        let metadata = {} as Metadata;
        metadata.specVersion = record['specVersion'];
        metadata.type = record['type'];
        metadata.name = record['name'];
        metadata.subName = record['subName'];
        metadata.description = record['description'];
        metadata.author = record['author'];
        metadata.defaultLocale = record['defaultLocale'];

        metadata.media = {
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
            metadata.media.hero = {
                contentType: '',
                integrity: {
                    hash: '',
                    type: 'SHA256',
                },
                uris: [record['hero']],
            };
        }

        metadata.media.gallery = [
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

        return metadata;
    };

    /**
     * It takes a record from the CSV file and transforms it into a FactoryMetaData object
     * @param {any} record - the row of the CSV file
     * @returns An object of type FactoryMetaData
     */
    private prepareFactory = (record: any): FactoryMetaData => {
        let factory: FactoryMetaData = this.prepareMetadata(record);

        // parse/process/add any FactoryMetadata specific properties here

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
                return Boolean(attribute[1]);
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
    };

    /**
     * It takes a record from the CSV file, and returns a TokenMetaData object
     * @param {any} record - any - this is the record that was parsed from the CSV file.
     * @returns  An object of type TokenMetaData
     */
    private prepareToken = (record: any): TokenMetaData => {
        console.log('parsing token');
        console.log(record);
        let token: TokenMetaData = { serialNumber: record['serialNumber'], ...this.prepareMetadata(record) };

        // parse/process/add any TokenMetaData specific properties here
        const tempAttributeList = [
            [record['Att Name 1'], record['Att Val 1']],
            [record['Att Name 2'], record['Att Val 2']],
            [record['Att Name 3'], record['Att Val 3']],
            [record['Att Name 4'], record['Att Val 4']],
            [record['Att Name 5'], record['Att Val 5']],
            [record['Att Name 6'], record['Att Val 6']],
            [record['Att Name 7'], record['Att Val 7']],
            [record['Att Name 8'], record['Att Val 8']],
            [record['Att Name 9'], record['Att Val 9']],
            [record['Att Name 10'], record['Att Val 10']],
            [record['Att Name 11'], record['Att Val 12']],
            [record['Att Name 11'], record['Att Val 12']],
        ]
            .filter((attribute) => {
                // to get rid of empty/null values
                return Boolean(attribute[0]);
            })
            .map((attribute) => {
                return {
                    [attribute[0]]: attribute[1],
                };
            });

        if (tempAttributeList.length) {
            token.attributes = Object.assign({}, ...tempAttributeList);
        }

        return token;
    };

    /**
     * It reads the factory and tokens CSV files, and returns an object with the factory and tokens data
     * @param {string} folderPath - The path to the folder containing the factory.csv and tokens.csv files.
     * @returns An object of type NFTData
     */
    async parse(folderPath: string): Promise<NFTData> {
        const factory: FactoryMetaData[] = await this.processFile(folderPath, 'factory');
        const tokens: TokenMetaData[] = await this.processFile(folderPath, 'tokens');
        const defaultTokenIndex = tokens.findIndex((x) => x.serialNumber === 'default');

        return {
            factory: factory[0],
            defaultToken: defaultTokenIndex === -1 ? undefined : tokens.splice(defaultTokenIndex, 1)[0],
            tokens,
        };
    }
}
