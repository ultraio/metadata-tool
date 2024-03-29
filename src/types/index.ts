import { MimeTypes } from './mimeTypes';

/**
 * A static resource provides a hash to check integrity
 */
export interface StaticResource {
    contentType: MimeTypes | null;
    uris: string[];
    integrity: {
        type: 'SHA256';
        hash: string;
    } | null;
}

/**
 * A dynamic resource can be refreshed to discover changes
 */
export interface DynamicResource {
    contentType: MimeTypes;
    uris: string[];
}

export interface Metadata {
    /**
     * The version of the NFT Factory metadata standard specification which the manifest uses. This enables the interpretation of the context. Compliant manifests MUST use a value of 0.1 when referring to this version of the specification.
     */
    specVersion: string;

    /**
     * Identifies the asset to which this NFT Factory represents
     */
    name: string;

    /**
     * A secondary name that identify a special flavor of the asset to which this NFT represents. For example “Limited Edition”
     */
    subName?: string;

    /**
     * Long description of the asset to which this NFT represents
     */
    description?: string;

    /**
     * Specify the author(s) of the asset to which this NFT represents
     */
    author?: string;

    /**
     * Specify the local of this metadata.
     * The value must be one of the locales from the list available here: https://github.com/unicode-org/cldr-json/blob/master/cldr-json/cldr-core/availableLocales.json
     */
    defaultLocale: 'en-US';

    /**
     * Specify the advertising content for this NFT Factory
     */
    media: {
        product: StaticResource;
        square: StaticResource;
        hero?: StaticResource;
        gallery?: StaticResource[];
    };

    /**
     * Specify the properties for this NFT Factory
     * This can be literally anything.
     */
    properties?: {
        [k: string]: unknown;
    };

    // Additional static URIs for content of this factory.
    resources?: {
        [k: string]: StaticResource;
    };
}

export interface FactoryMetaData extends Metadata {
    /**
     * Describes the attributes of each NFT generated by this factory
     * Used for searchability by the data team.
     * Corresponding token should have matching attributes.
     */
    attributes?: {
        [k: string]: {
            type: 'boolean' | 'number' | 'string' | 'ISODateString';
            name: string;
            description?: string;
        };
    };

    /**
     * URI template for tokens of this factory
     */
    tokenUriTemplate: '{serial_number}' | '{hash}';
}

export interface TokenMetaData extends Metadata {
    /**
     * Serial number for the token
     */
    serialNumber: string;

    /**
     * Specify the attributes for this token.
     * Should match token factory.
     */
    attributes?: {
        [k: string]: boolean | string | number;
    };

    // Additional dynamic URIs for content of this token.
    dynamicResources?: {
        [k: string]: DynamicResource;
    };
}

// Can probably come up with a better name for this interface
export interface NFTData {
    factory: FactoryMetaData;
    defaultToken: TokenMetaData | undefined;
    tokens: TokenMetaData[];
}
