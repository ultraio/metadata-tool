import readline from 'readline';

/**
 * Util function to prompt the user. Can also be used for 'Press enter to continue..'
 *
 * @export
 * @param {string} query - The question you want to ask the user.
 * @return {*}  {Promise<string>} - A promise that resolves to a string answer
 */
export function promptUser(query: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) =>
        rl.question(query, (ans) => {
            rl.close();
            resolve(ans);
        })
    );
}

/**
 * Util sleep/wait function
 * @param {number} ms - The number of milliseconds to wait before resolving the promise.
 */
export function sleep(ms: number) {
    new Promise((resolve) => setTimeout(resolve, ms));
}
