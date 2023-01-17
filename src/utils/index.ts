import inquirer from 'inquirer';

/**
 * Util function to prompt the user. Can also be used for 'Press enter to continue..'
 *
 * @export
 * @param {string} query - The question you want to ask the user.
 * @return {*}  {Promise<string>} - A promise that resolves to a string answer
 */
export async function promptUser(query: string): Promise<{ answer: string }> {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'answer',
            message: query,
        },
    ]);
}

/**
 * Util sleep/wait function
 * @param {number} ms - The number of milliseconds to wait before resolving the promise.
 */
export function sleep(ms: number) {
    new Promise((resolve) => setTimeout(resolve, ms));
}
