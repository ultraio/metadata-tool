import { ReportGenerator } from '../src/utils/reportGenerator';

describe('report generator test', () => {
    test('should append message to report generator', () => {
        ReportGenerator.add('hello world', false);
        expect(ReportGenerator.get().length >= 1).toBe(true);
    });
});
