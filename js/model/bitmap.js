export class OMBitmap {
    constructor(data, width, height, virtualPalette) {
        this.data = data;
        this.width = width;
        this.height = height;
        this.virtualPalette = virtualPalette;
    }

    getImgData(physicalPalette = null) {
        let palette = physicalPalette || this.virtualPalette.physicalPalette;

        let imgData = new ImageData(this.width, this.height);
        for(let i = 0; i < this.width*this.height; i++) {
            let pixel = palette.getColor(this.data[i]);
            if(pixel[0] + pixel[1] + pixel[2] == 0) {
                imgData.data[i*4+3] = 0;
                continue;
            }
            imgData.data[i*4] = pixel[0];
            imgData.data[i*4+1] = pixel[1];
            imgData.data[i*4+2] = pixel[2];
            imgData.data[i*4+3] = pixel[3];
        }
        return imgData;
    }

    clone() {
        return new OMBitmap(
            this.data.slice(), 
            this.width, 
            this.height, 
            this.virtualPalette
        );
    }
}