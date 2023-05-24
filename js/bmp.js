import { OMBitmap } from "./model/bitmap.js";
import { OMPalette } from "./model/palette.js";

export const BMP = {

    create: (bitmap) => {
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
        
        const lineMargin = new Array(3 - ((bitmap.width+3) % 4)).fill(0);
        let pixelLines = [];
        for(let y = bitmap.height-1; y >= 0; y--) {
            let line = [];
            line = bitmap.data.slice(y*bitmap.width, (y+1)*bitmap.width);
            pixelLines.push(...line, ...lineMargin);
        }
        const pixelData = new Uint8Array(pixelLines);

        return new Blob([header, palette, pixelData], {type: 'image/bmp'});
    },

    parse: (file) => {
        if (file.byteLength < 54 + 1024) return;
        if(new Uint16Array(file.slice(0, 2))[0] != 19778) return;
        const [dibHeaderSize, width, height, planesAndBits, compression] = Array.from(new Uint32Array(file.slice(14, 14 + 20)));
        if(dibHeaderSize != 40) return;
        if(planesAndBits != 524289) return; // 1 plane, 8 bits per pixel
        if(compression != 0) return;

        const paletteData = Array.from(new Uint8Array(file.slice(54, 54 + 1024)));
        
        const pixelLines = Array.from(new Uint8Array(file.slice(54 + 1024)));
        const lineMarginSize = 3 - ((width+3) % 4);
        let pixelData = [];
        for(let y = height-1; y >= 0; y--) {
            let line = pixelLines.slice(y*(width+lineMarginSize), (y+1)*(width+lineMarginSize)-lineMarginSize);
            pixelData.push(...line);
        }

        return [paletteData, pixelData, width, height];
    },

    save: (bitmap, filename) => {
        const file = BMP.create(bitmap);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(file);
        a.download = filename;
        a.click();
    },

    open: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/bmp';
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = e => {
                console.log(e);
                const bitmap = BMP.parse(e.target.result);
                console.log(bitmap);
            }
            reader.readAsArrayBuffer(file);
        }
        input.click();
    }
}