export const ValidMimeTypes = [
    // Data
    'application/json',
    // Image
    'image/bmp',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    // Video
    'video/webm',
    'video/x-msvideo',
    'video/mp4',
] as const;

export type MimeTypes = typeof ValidMimeTypes[number];
