import { ReportGenerator } from './reportGenerator';

const exitCodes = ['exit', 'SIGINT', 'SIGQUIT', 'SIGTERM'];

export const ExitHandlers = {
    init() {
        for (let i = 0; i < exitCodes.length; i++) {
            process.on(exitCodes[i], (code) => {
                ReportGenerator.print.toFile();
            });
        }
    },
};
