export const BMP = {
    save: (bitmap, filename) => {
        const headersLength = 14 + 40;
        const pixelDataLength = bitmap.data.length;
        const paletteLength = bitmap.virtualPalette.physicalPalette.data.length;
        const fileSize = headersLength + pixelDataLength + paletteLength;

        const header = new Uint8Array([
            0x42, 0x4D, // BM
            ...new Uint8Array((new Uint32Array([fileSize])).buffer), // file size
            0x00, 0x00, 0x00, 0x00, // reserved
            ...new Uint8Array((new Uint32Array([headersLength + paletteLength])).buffer), // pixelData data offset
            0x28, 0x00, 0x00, 0x00, // DIB header size
            ...new Uint8Array((new Uint32Array([bitmap.width])).buffer), // Width
            ...new Uint8Array((new Uint32Array([bitmap.height])).buffer), // Height
            0x01, 0x00, // planes
            0x08, 0x00, // bits per pixel
            0x00, 0x00, 0x00, 0x00, // compression
            0x00, 0x00, 0x00, 0x00, // image size (0 for uncompressed)
            0x00, 0x00, 0x00, 0x00, // x pixels per meter
            0x00, 0x00, 0x00, 0x00, // y pixels per meter
            0x00, 0x01, 0x00, 0x00, // colors in color table (256)
            0x00, 0x00, 0x00, 0x00, // important color count (256)
        ]);

        const palette = new Uint8Array(bitmap.virtualPalette.physicalPalette.getBGRAData());
        
        const lineMargin = new Array(bitmap.width % 4).fill(0);
        let pixelLines = [];
        for(let y = bitmap.height-1; y >= 0; y--) {
            let line = [];
            line = bitmap.data.slice(y*bitmap.width, (y+1)*bitmap.width);
            pixelLines.push(...line, ...lineMargin);
        }
        const pixelData = new Uint8Array(pixelLines);

        const file = new Blob([header, palette, pixelData], {type: 'image/bmp'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(file);
        a.download = filename;
        a.click();
    }
}