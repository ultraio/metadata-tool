export type UrlMap = { [relativePath: string]: string };
export type HashUrl = { hash: string; url: string };
export type SerialHashUrl = { serialNumber: number | string } & HashUrl;

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
        tokenUriTemplate: '{serial_number}' | '{hash}'; // The uri template to follow to tokens - either "{serial_number}" or "{hash}"
    };

    /**
     * The default token hash & url.
     *
     * @type {HashUrl}
     * @memberof UploadOutput
     */
    defaultToken: HashUrl | undefined;

    /**
     * The factory hash & url.
     *
     * @type {HashUrl}
     * @memberof UploadOutput
     */
    factory: HashUrl;

    /**
     * List of hashes from individual token files organized by serialNumber
     *
     * @type {Array<SerialHash>}
     * @memberof UploadOutput
     */
    tokens: Array<SerialHashUrl>;

    /**
     * Urls for media (images etc).
     *
     * @type {UrlMap}
     * @memberof UploadOutput
     */
    media: UrlMap;
}
