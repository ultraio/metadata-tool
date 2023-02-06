import { MimeTypes } from '../types/mimeTypes';
import { ErrorGenerator } from './errorGenerator';
import { ReportGenerator } from './reportGenerator';

const DataBindings: { [key: string]: MimeTypes } = {
    // data formats
    '.json': 'application/json',
    // image formats
    '.png': 'image/png',
    '.bmp': 'image/bmp',
    '.gif': 'image/gif',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.webp': 'image/webp',
    // video formats
    '.avi': 'video/x-msvideo',
    '.webm': 'video/webm',
};

export function pathToMimeType(path: string): MimeTypes | null {
    if (path === '') {
        ReportGenerator.add(ErrorGenerator.get('UNSUPPORTED_FILE_TYPE', 'EMPTY_FILE_PATH'));
        return null;
    }

    const keys = Object.keys(DataBindings);

    for (let key of keys) {
        if (!path.includes(key)) {
            continue;
        }

        return DataBindings[key];
    }

    ReportGenerator.add(ErrorGenerator.get('UNSUPPORTED_FILE_TYPE', path));
    return null;
}
