export type UrlMap = { [relativePath: string]: string };
export type SerialHash = { serialNumber: number | string; hash: string };

export interface FileHashes {
    /**
     * The default token hash from the file.
     *
     * @type {string}
     * @memberof FileHashes
     */
    defaultToken: string;

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
