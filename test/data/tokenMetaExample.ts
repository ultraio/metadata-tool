import { TokenMetaData } from '../../src/types';

export const TokenMetaExample: TokenMetaData = {
    serialNumber: 'default',
    specVersion: '0.1',
    type: 'collectible',
    defaultLocale: 'en-US',
    name: 'Heroic Power Suit #0',
    subName: 'First Minted Power Suit',
    author: 'Bethesda Studios',
    description: 'Limited Edition. First Copy of Power Suit Armour Collectible.',
    media: {
        product: {
            contentType: 'image/png',
            integrity: {
                hash: 'a06f83840e3f6a31a2c6058ed47d2216958456468e221c3b9ffb435c5ec85d8d',
                type: 'SHA256',
            },
            uris: ['./images/tokens/1/media.png'],
        },
        square: {
            contentType: 'image/png',
            integrity: {
                hash: 'a06f83840e3f6a31a2c6058ed47d2216958456468e221c3b9ffb435c5ec85d8d',
                type: 'SHA256',
            },
            uris: ['./images/tokens/1/square.png'],
        },
    },
    attributes: {
        armour: 5,
        health: 5,
        colour: '#FF0000',
    },
    resources: {},
    properties: {},
    dynamicResources: {},
};
