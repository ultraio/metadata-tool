export type Environment = 'dev' | 'prod' | 'qa' | 'staging' | 'custom';

/**
 * A static resource provides a hash to check integrity
 */
export interface StaticResource {
    contentType: string;
    uris: string[];
    integrity: {
        type: 'SHA256';
        hash: string;
    };
}

/**
 * A dynamic resource can be refreshed to discover changes
 */
export interface DynamicResource {
    contentType: string;
    uris: string[];
}

export interface FactoryMetaData {
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
     * Specify the type of the NFT asset
     */
    type?: 'collectible' | 'game';

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

    // Additional static URIs for content of this factory.
    resources?: {
        [k: string]: StaticResource;
    };
}

export interface TokenMetaData {
    /**
     * The version of the NFT metadata standard specification which the manifest uses. This enables the interpretation of the context. Compliant manifests MUST use a value of 0.1 when referring to this version of the specification.
     */
    specVersion: string;

    /**
     * Identifies the asset to which this NFT represents
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
     * Specify the type of the NFT asset
     */
    type?: 'collectible';

    /**
     * Specify the author(s) of the asset to which this NFT represents
     */
    author?: string;

    /**
     * Specify the local of this metadata. The value must be one of the locales from the list available here: https://github.com/unicode-org/cldr-json/blob/master/cldr-json/cldr-core/availableLocales.json
     */
    defaultLocale: 'en-US';

    /**
     * Specify the advertising content for this NFT
     */
    media: {
        product: StaticResource;
        square: StaticResource;
        hero?: StaticResource;
        gallery?: StaticResource[];
    };

    /**
     * Specify the properties for this NFT
     */
    properties?: {
        [k: string]: unknown;
    };

    /**
     * Specify the attributes for this token.
     * Should match token factory.
     */
    attributes?: {
        [k: string]: boolean | string | number;
    };

    dynamicAttributes?: DynamicResource;

    resources?: {
        [k: string]: StaticResource;
    };

    // Additional dynamic URIs for content of this token.
    dynamicResources?: {
        [k: string]: DynamicResource;
    };
}
