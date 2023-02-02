const ReplaceMe = '>MISSING_ARGUMENT<';

const ErrorList = {
    NO_ERROR_CODE: `Error code does not exist. ${ReplaceMe}`,
    MISSING_FACTORY_FILE: `Required file factory.${ReplaceMe} file not found. Please make sure the files exists in the provided directory!`,
    MISSING_DEFAULT_TOKEN_FILE: `Required file defaultToken.${ReplaceMe} file not found. Please make sure the files exists in the provided directory!`,
    INVALID_DIRECTORY: `Directory ${ReplaceMe} does not exist!. Please provide a valid directory.`,
    INVALID_URL: `Url was invalid. Provide a valid url.`,
};

/**
 * Takes all arguments and tries to apply them to the error message.
 *
 * @param {string} errorMessage
 * @param {...Array<string>} args
 * @return {*}
 */
function formatError(errorMessage: string, ...args: Array<string>) {
    for (let i = 0; i < args.length; i++) {
        errorMessage = errorMessage.replace(ReplaceMe, args[i]);
    }

    return errorMessage;
}

export const ErrorGenerator = {
    /**
     * Returns a formatted error message.
     *
     * @param {keyof typeof ErrorList} key
     * @param {...Array<string>} args
     * @return {string}
     */
    get(key: keyof typeof ErrorList, ...args: Array<string>): string {
        return typeof ErrorList[key] === 'undefined'
            ? formatError(ErrorList.NO_ERROR_CODE, ...args)
            : formatError(ErrorList[key], ...args);
    },
};
