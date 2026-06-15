/**
 * Compression Utility for Feature Desk
 * 
 * Provides client-side compression for:
 * 1. Images (Canvas-based resizing/compression)
 * 2. JSON Data (GZIP using native CompressionStream API)
 */

/**
 * Compresses an image file by resizing and reducing quality.
 * @param file The original image File object
 * @param maxWidth Maximum width of the output image (default 1024px)
 * @param quality Quality of the output JPEG (0.0 to 1.0, default 0.7)
 * @returns Promise resolving to a compressed Blob
 */
export const compressImage = async (file: File, maxWidth = 1024, quality = 0.7): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };
        reader.onerror = (e) => reject(e);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas context not available'));
                return;
            }

            // Draw image on canvas
            ctx.drawImage(img, 0, 0, width, height);

            // Export as Blob
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Image compression failed'));
                    }
                },
                'image/jpeg',
                quality
            );
        };

        reader.readAsDataURL(file);
    });
};

/**
 * Compresses a JSON object or any serializable data using GZIP + CompressionStream.
 * @param data The data to compress
 * @returns Promise resolving to a compressed Blob (application/gzip)
 */
export const compressJson = async (data: any): Promise<Blob> => {
    try {
        const jsonString = JSON.stringify(data);
        const stream = new Blob([jsonString]).stream();

        // Use native CompressionStream (available in most modern browsers)
        const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));

        return await new Response(compressedStream).blob();
    } catch (error) {
        console.error('JSON Compression Error:', error);
        throw error;
    }
};

/**
 * Decompresses a GZIP-compressed Blob back into a JSON object.
 * @param blob The compressed Blob
 * @returns Promise resolving to the parsed data
 */
export const decompressJson = async (blob: Blob): Promise<any> => {
    try {
        const stream = blob.stream().pipeThrough(new DecompressionStream('gzip'));
        const decompressedBlob = await new Response(stream).blob();
        const text = await decompressedBlob.text();
        return JSON.parse(text);
    } catch (error) {
        // Fallback: If decompression fails, maybe it wasn't compressed?
        // Try parsing directly if it looks like JSON text?
        // But Blob text reading is async.
        // For now, assume it was compressed if this function is called.
        console.error('JSON Decompression Error:', error);
        throw error;
    }
};
