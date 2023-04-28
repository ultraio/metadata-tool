import path from 'path';
import fs from 'fs';

const messages: Array<{ time: number; message: string }> = [];
const REPORT_NAME = 'metadata-tool-report.txt';

export const ReportGenerator = {
    /**
     * Add a message to the report generator.
     * Automatically prints to console.
     *
     * @param {string} message
     */
    add(message: string, logToConsole = true) {
        const time = Date.now();
        messages.push({ time, message });

        if (!logToConsole) {
            return;
        }

        console.log(`> ${message}`);
    },
    get() {
        return messages;
    },
    print: {
        /**
         * Print all messages to the console.
         */
        toConsole() {
            for (let i = 0; i < messages.length; i++) {
                console.log(`> ${messages[i]}`);
            }
        },
        /**
         * Print all messages to file.
         */
        toFile() {
            if (messages.length <= 0) {
                return;
            }

            // cwd fix for pkg - can't use process.cwd() in packaged binary/executable
            const basePath = process.env.ENV == 'DEV' ? process.cwd() : path.dirname(process.execPath);
            const filePath = path.join(basePath, '/', REPORT_NAME).replace(/\\/gm, '/');
            if (fs.existsSync(filePath)) {
                fs.rmSync(filePath, { force: true });
            }

            for (let i = 0; i < messages.length; i++) {
                const timeString = new Date(messages[i].time).toISOString().slice(11, 19);
                fs.appendFileSync(filePath, `[${timeString}] ${messages[i].message}\r\n`);
            }

            console.log(`> Generated Report @ ${filePath}`);
        },
    },
};
