import { ReportGenerator } from './reportGenerator';

const exitCodes = ['exit', 'SIGINT', 'SIGQUIT', 'SIGTERM'];

export const ExitHandlers = {
    /**
     * Wraps any process responses to automatically print an error log on exit.
     *
     */
    init() {
        ReportGenerator.add('Initialized Exit Handlers', false);
        for (let i = 0; i < exitCodes.length; i++) {
            process.on(exitCodes[i], (code) => {
                ReportGenerator.print.toFile();
            });
        }
    },
};
