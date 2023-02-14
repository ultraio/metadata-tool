import { UrlMap } from 'types/uploadOutput';

const MappedUrls: UrlMap = {};

export const UrlMapper = {
    /**
     * Set a URL in the url map.
     *
     * @param {string} relativePath
     * @param {string} url
     */
    set(relativePath: string, url: string) {
        MappedUrls[relativePath] = url;
    },
    /**
     * Get the current URL mappings for upload.
     *
     * @return {*}
     */
    get() {
        return MappedUrls;
    },
};
