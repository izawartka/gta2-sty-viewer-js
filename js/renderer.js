export class Renderer {
    constructor(sty) {
        this.sty = sty;
    }

    getTile(tilePageID, tileIDinPage) {
        let tileID = tilePageID * 16 + tileIDinPage;
        let tile = this.sty.getTile(tilePageID, tileIDinPage);

        let palID = this.sty.getPPaletteID('tile', tileID);
        let pal = this.sty.getPPalette(palID);

        const imgData = new ImageData(64, 64);

        for(let p = 0; p < 64*64; p++) {
            imgData.data[p*4+0] = pal[tile[p]*4+2];
            imgData.data[p*4+1] = pal[tile[p]*4+1];
            imgData.data[p*4+2] = pal[tile[p]*4+0];
            imgData.data[p*4+3] = 255 - pal[tile[p]*4+3];
        }

        return imgData;
    }

    renderTile(canvas, tilePageID, tileIDinPage) {
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const imgData = this.getTile(tilePageID, tileIDinPage);

        ctx.putImageData(imgData, 0, 0);
    }

    renderTilesList(canvas) {
        let tilePages = this.sty.getTilePagesArray();
        canvas.width = 256 * tilePages.length;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        tilePages.forEach((tilesPage, tilePageID) => {
            for(let t = 0; t < tilesPage.length; t++) {
                let x = (t % 4)*64 + tilePageID*256;
                let y = ~~(t/4)*64; 

                const imgData = this.getTile(tilePageID, t);
                ctx.putImageData(imgData, x, y);
            }
        });
    }

    getPointedTileID(canvas, e) {
        let rect = canvas.getBoundingClientRect();

        let mx = e.clientX - rect.left;
        let my = e.clientY - rect.top;
        let pageID = ~~(mx / 256);
        let tileIDinPage = ~~((mx % 256)/64) + (~~(my/64))*4;

        return pageID*16+tileIDinPage;
    }

    renderPalettesList(canvas, xScale = 4) {
        canvas.height = 256;
        canvas.width = this.sty.getPPalettePagesCount() * 64 * xScale;
        let ctx = canvas.getContext('2d');

        this.sty.getAllPPalettesArray().forEach((palette, paletteID) => {
            let imgData = ctx.createImageData(1, 256);
            for(let p = 0; p < 256*4; p+=4) {
                imgData.data[p+0] = palette[p+2];
                imgData.data[p+1] = palette[p+1];
                imgData.data[p+2] = palette[p+0];
                imgData.data[p+3] = 255-palette[p+3];
            }
            for(let i = 0; i < xScale; i++)
            ctx.putImageData(imgData, paletteID*xScale+i, 0);
        });
    }

    getSprite(spriteID, remap = -1) {
        let spriteIndex = this.sty.getSpriteIndex(spriteID);
        let width = spriteIndex.size[0];
        let height = spriteIndex.size[1];
        let spritePos = this.sty.getSpritePixelPos(spriteIndex.ptr);
        let palID = (remap == -1) ? this.sty.getPPaletteID('sprite', spriteID) : remap;
        let pal = this.sty.getPPalette(palID);

        const imgData = new ImageData(width, height);

        for(let p = 0; p < width * height; p++) {
            let x = p % width + spritePos.x;
            let y = ~~(p/width) + spritePos.y;
            let pixel = this.sty.getSpritePixel(spritePos.page, x, y);

            imgData.data[p*4+0] = pal[pixel*4+2];
            imgData.data[p*4+1] = pal[pixel*4+1];
            imgData.data[p*4+2] = pal[pixel*4+0];
            imgData.data[p*4+3] = 255 - pal[pixel*4+3];
        }

        return {
            imgData, 
            pos: spritePos,
            index: spriteIndex,
        };
    }

    renderSprite(canvas, spriteID, remap = -1) {
        const spriteIndex = this.sty.getSpriteIndex(spriteID);
        canvas.width = spriteIndex.size[0];
        canvas.height = spriteIndex.size[1];

        const ctx = canvas.getContext('2d');
        const spriteData = this.getSprite(spriteID, remap);

        ctx.putImageData(spriteData.imgData, 0, 0);
    }

    renderSpritesList(canvas) {
        canvas.height = 256;
        canvas.width = this.sty.data['SPRG'].pages.length * 256;
        let ctx = canvas.getContext('2d');

        for(let s = 0; s < this.sty.getSpritesCount(); s++) {
            const spriteData = this.getSprite(s);

            ctx.putImageData(spriteData.imgData, spriteData.pos.absX, spriteData.pos.y);
        }
    }

    getPointedSpriteID(canvas, e) {
        let rect = canvas.getBoundingClientRect();

        let mx = e.clientX - rect.left;
        let my = e.clientY - rect.top;
        return this.sty.getSpriteIDByPos(mx, my);
    }

    renderCarsList(canvas) {
        let totalWidth = 0;
        const carsInfo = this.sty.getAllCarsInfo();

        carsInfo.forEach(carInfo=>{
            totalWidth += carInfo.width + 16;
        })

        canvas.width = totalWidth;
        canvas.height = 128;
        let ctx = canvas.getContext('2d');
        let currentX = 0;
        let lastSpriteData;
        let lastSpriteID = this.sty.getSpriteBase('car')-1;
        carsInfo.forEach(carInfo => {
            if(carInfo.sprite) {
                lastSpriteID++;
                lastSpriteData = this.getSprite(lastSpriteID);
            }

            let y = 0;
            let x = currentX - (lastSpriteData.index.size[0] - carInfo.width)/2
            ctx.putImageData(lastSpriteData.imgData, x, y);
            currentX += carInfo.width + 16;
        })        
    }

    renderCarHitbox(canvas, carID) {
        let ctx = canvas.getContext('2d');
        const carInfo = this.sty.getCarInfo(carID);
        ctx.lineWidth = 1;
        let cx = ~~(canvas.width/2);
        let cy = ~~(canvas.height/2);
        let corx = ~~(cx-carInfo.width/2)+.5;
        let cory = ~~(cy-carInfo.height/2)+.5;

        ctx.strokeStyle = '#f88';
        ctx.strokeRect(corx, cy+carInfo.rear_wheel_offset+.5, carInfo.width-1, carInfo.front_wheel_offset-carInfo.rear_wheel_offset-1);
        ctx.strokeStyle = '#88f';
        ctx.strokeRect(corx, cy+carInfo.rear_window_offset+.5, carInfo.width-1, carInfo.front_window_offset-carInfo.rear_window_offset-1);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(corx, cory, carInfo.width-1, carInfo.height-1);
    }

    getPointedCarID(canvas, e) {
        let rect = canvas.getBoundingClientRect();
        let mx = e.clientX - rect.left;

        const carsInfo = this.sty.getAllCarsInfo();

        let sumx = 0;
        for(let i = 0; i < carsInfo.length; i++) {
            sumx += carsInfo[i].width + 16;
            if(sumx > mx) return i;
        }
    }

    // renderCarTurret(canvas, carID) {
    //     let ctx = canvas.getContext('2d');
    //     let cx = ~~(canvas.width/2);
    //     let cy = ~~(canvas.height/2);

    // }
}