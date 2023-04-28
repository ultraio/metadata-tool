export const TokenSchema = {
    type: 'object',
    title: 'TokenMetadata',
    description: 'The NFT metadata',
    properties: {
        serialNumber: {
            type: ['string', 'number'],
            description: 'A serial identifier of this token',
            nullable: true,
        },
        specVersion: {
            type: 'string',
            description:
                'The version of the NFT metadata standard specification which the manifest uses. This enables the interpretation of the context. Compliant manifests MUST use a value of 0.1 when referring to this version of the specification.',
        },
        type: {
            type: 'string',
            enum: ['game', 'collectible'],
            minLength: 1,
            maxLength: 256,
            description: 'Identifies the type of asset that this NFT Factory represents',
        },
        name: {
            type: 'string',
            minLength: 1,
            maxLength: 256,
            description: 'Identifies the asset to which this NFT represents',
        },
        subName: {
            type: 'string',
            maxLength: 256,
            description:
                'A secondary name that identify a special flavor of the asset to which this NFT represents. For example “Limited Edition”',
        },
        description: {
            type: 'string',
            description: 'Long description of the asset to which this NFT represents',
            maxLength: 4096,
        },
        author: {
            type: 'string',
            maxLength: 256,
            description: 'Specify the author(s) of the asset to which this NFT represents',
        },
        defaultLocale: {
            type: 'string',
            enum: ['en-US'],
            description:
                'Specify the local of this metadata. The value must be one of the locales from the list available here: https://github.com/unicode-org/cldr-json/blob/master/cldr-json/cldr-core/availableLocales.json',
        },
        media: {
            description: 'Specify the advertising content for this NFT',
            type: 'object',
            properties: {
                product: { $ref: '#/definitions/staticResource' },
                square: { $ref: '#/definitions/staticResource' },
                hero: { $ref: '#/definitions/staticResource' },
                gallery: {
                    description:
                        'A list of path pointing to images, videos... relative from this manifest relative from this manifest.',
                    type: 'array',
                    items: { $ref: '#/definitions/staticResource' },
                },
            },
            required: ['product', 'square'],
            additionalProperties: false,
        },
        properties: {
            description: 'Specify the properties for this NFT',
            type: 'object',
            additionalProperties: true,
        },
        attributes: {
            description: 'Specify the attributes for this NFT',
            type: 'object',
            additionalProperties: {
                oneOf: [{ type: 'boolean' }, { type: 'string' }, { type: 'number' }],
            },
        },
        dynamicAttributes: { $ref: '#/definitions/dynamicResource' },
        resources: {
            type: 'object',
            additionalProperties: { $ref: '#/definitions/staticResource' },
        },
        dynamicResources: {
            type: 'object',
            additionalProperties: { $ref: '#/definitions/dynamicResource' },
        },
    },
    required: ['specVersion', 'name', 'defaultLocale', 'media'],
    additionalProperties: false,
    definitions: {
        staticResource: {
            type: 'object',
            title: 'StaticResource',
            description: 'A static resource provides a hash to check integrity',
            properties: {
                contentType: { type: 'string' },
                uris: {
                    type: 'array',
                    minItems: 1,
                    items: { type: 'string' },
                },
                integrity: {
                    type: 'object',
                    properties: {
                        type: { type: 'string', enum: ['SHA256'] },
                        hash: {
                            type: 'string',
                            description: 'only 64 characters SHA256 hash is supported initially',
                            minLength: 64,
                            maxLength: 64,
                            pattern: '^([a-fA-F0-9]{2})+$',
                        },
                    },
                    required: ['type', 'hash'],
                    additionalProperties: false,
                    nullable: true,
                },
            },
            required: ['contentType', 'uris'],
            additionalProperties: false,
        },
        dynamicResource: {
            type: 'object',
            title: 'DynamicResource',
            description: 'A dynamic resource can be refreshed to discover changes',
            properties: {
                contentType: { type: 'string' },
                uris: {
                    type: 'array',
                    minItems: 1,
                    items: { type: 'string' },
                },
            },
            required: ['contentType', 'uris'],
            additionalProperties: false,
        },
    },
};
