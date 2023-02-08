const ReplaceMe = '>MISSING_ARGUMENT<';

const ErrorList = {
    NO_ERROR_CODE: `Error code does not exist. ${ReplaceMe}`,
    MISSING_FACTORY_FILE: `Required file factory.${ReplaceMe} file not found. Please make sure the files exists in the provided directory!`,
    MISSING_DEFAULT_TOKEN_FILE: `Required file defaultToken.${ReplaceMe} file not found. Please make sure the files exists in the provided directory!`,
    INVALID_DIRECTORY: `Directory ${ReplaceMe} does not exist!. Please provide a valid directory.`,
    INVALID_URL: `Url was invalid. Provide a valid url.`,
    INVALID_TOKEN_SCHEMA_AT: `Invalid token schema at index: ${ReplaceMe}`,
    INVALID_SCHEMAS: `Invalid schema(s) were found. Check the error log and correct any mistakes in the file format.`,
    INVALID_SCHEMA_FILE: `Invalid schema file for: ${ReplaceMe}`,
    UNSUPPORTED_FILE_TYPE: `File at path '${ReplaceMe}' is not a supported file format.`,
    UNREACHABLE_FILE: `File with URL or Path of '${ReplaceMe}' could not be reached or found.`,
};

const Internal = {
    /**
     * Takes all arguments and tries to apply them to the error message.
     *
     * @param {string} errorMessage
     * @param {...Array<string>} args
     * @return {*}
     */
    formatError(errorMessage: string, ...args: Array<string | number>) {
        for (let i = 0; i < args.length; i++) {
            errorMessage = errorMessage.replace(ReplaceMe, String(args[i]));
        }

        return errorMessage;
    },
};

export const ErrorGenerator = {
    /**
     * Returns a formatted error message.
     *
     * @param {keyof typeof ErrorList} key
     * @param {...Array<string>} args
     * @return {string}
     */
    get(key: keyof typeof ErrorList, ...args: Array<string | number>): string {
        return typeof ErrorList[key] === 'undefined'
            ? Internal.formatError(ErrorList.NO_ERROR_CODE, ...args)
            : Internal.formatError(ErrorList[key], ...args);
    },
};
