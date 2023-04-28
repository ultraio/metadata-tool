import { FactoryMetaData } from '../../src/types';

export const FactoryMetaExample: FactoryMetaData = {
    specVersion: '1.0',
    defaultLocale: 'en-US',
    tokenUriTemplate: '{tokenSerialNum}',
    type: 'game',
    name: 'Fallout 99',
    author: 'Bethesda Studios',
    description: "Explore the wasteland of 'x' in this post apocalyptic adventure game.",
    media: {
        product: {
            contentType: 'image/png',
            integrity: {
                hash: 'a06f83840e3f6a31a2c6058ed47d2216958456468e221c3b9ffb435c5ec85d8d',
                type: 'SHA256',
            },
            uris: ['./images/product.png'],
        },
        square: {
            contentType: 'image/png',
            integrity: {
                hash: 'a06f83840e3f6a31a2c6058ed47d2216958456468e221c3b9ffb435c5ec85d8d',
                type: 'SHA256',
            },
            uris: ['./images/product.png'],
        },
    },
    attributes: {},
    resources: {
        content: {
            contentType: 'image/png',
            integrity: {
                hash: 'a06f83840e3f6a31a2c6058ed47d2216958456468e221c3b9ffb435c5ec85d8d',
                type: 'SHA256',
            },
            uris: ['./images/extra.png'],
        },
    },
    properties: {},
};
