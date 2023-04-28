export type UrlMap = { [relativePath: string]: string };
export type SerialHash = { serialNumber: number | string; hash: string };

export interface FileHashes {
    /**
     * The default token hash from the file.
     *
     * @type {string}
     * @memberof FileHashes
     */
    defaultToken: string | undefined;

    /**
     * The factory hash from the file.
     *
     * @type {string}
     * @memberof FileHashes
     */
    factory: string;

    /**
     * List of hashes from individual token files organized by serialNumber
     *
     * @type {Array<SerialHash>}
     * @memberof FileHashes
     */
    tokens: Array<SerialHash>;
}

export interface UploadOutput {
    /**
     * The name of this collection
     *
     * @type {string}
     * @memberof UploadOutput
     */
    collectionName: string;

    /**
     * Upload env info
     *
     * @type {Object}
     * @memberof UploadOutput
     */
    environment: {
        env: string;
        url: string;

        tokenUriTemplate: string; // The uri template to follow to tokens - either "{tokenSerialNum}" or "{tokenHash}"
    };

    /**
     * Hashes relating to the individual file outputs.
     *
     * @type {FileHashes}
     * @memberof UploadOutput
     */
    hashes: FileHashes;

    /**
     * What relative URL belongs to what URL path.
     *
     * @type {UrlMap}
     * @memberof UploadOutput
     */
    urls: UrlMap;
}
