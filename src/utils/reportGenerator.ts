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
            console.log('> Generating report...');

            const filePath = path.join(process.cwd(), '/', REPORT_NAME).replace(/\\/gm, '/');
            if (fs.existsSync(filePath)) {
                fs.rmSync(filePath, { force: true });
            }

            for (let i = 0; i < messages.length; i++) {
                const timeString = new Date(messages[i].time).toISOString().slice(11, 19);
                fs.appendFileSync(filePath, `[${timeString}] ${messages[i].message}\r\n`);
            }
        },
    },
};
