const UrlMap: { [relativePath: string]: string } = {};

export const UrlMapper = {
    /**
     * Set a URL in the url map.
     *
     * @param {string} relativePath
     * @param {string} url
     */
    set(relativePath: string, url: string) {
        UrlMap[relativePath] = url;
    },
    /**
     * Get the current URL mappings for upload.
     *
     * @return {*}
     */
    get() {
        return UrlMap;
    },
};
