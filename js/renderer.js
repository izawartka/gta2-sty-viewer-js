import { carTurrets } from "./constants.js";

export class Renderer {
    constructor(sty) {
        this.sty = sty;
        this.cachedPalCanv = undefined;
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

    renderPalettesList(canvas, xScale = 4, xMarker = -1) {
        if(!this.cachedPalCanv) this.cachePalettesList(xScale);

        canvas.width = this.cachedPalCanv.width;
        canvas.height = this.cachedPalCanv.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.cachedPalCanv, 0, 0);

        if(xMarker == -1) return;
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.strokeRect(xMarker*xScale-.5, -.5, xScale+1, canvas.height+1);
    }

    cachePalettesList(xScale = 4) {
        this.cachedPalCanv = document.createElement('canvas');
        this.cachedPalCanv.height = 256;
        this.cachedPalCanv.width = this.sty.getPPalettePagesCount() * 64 * xScale;
        let ctx = this.cachedPalCanv.getContext('2d');

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

    renderPaletteSel(canvas, paletteID, scale = 4, xMarker = -1) {
        canvas.width = 256 * scale;
        canvas.height = 24;
        const ctx = canvas.getContext('2d');

        let imgData = ctx.createImageData(256, 1);
        let palette = this.sty.getPPalette(paletteID);
        for(let p = 0; p < 256*4; p+=4) {
            ctx.fillStyle = `rgba(${palette[p+2]}, ${palette[p+1]}, ${palette[p+0]}, ${255-palette[p+3]})`;
            ctx.fillRect(p/4*scale, 0, scale, canvas.height);
        }

        if(xMarker == -1) return;
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.strokeRect(xMarker*scale-.5, -.5, scale+1, canvas.height+1);
    };

    getPointedPaletteID(canvas, e, scale = 4) {
        let rect = canvas.getBoundingClientRect();
        let curX = e.clientX - rect.left;
        let id = ~~((curX * canvas.width) / (rect.width * scale));
        return id;
    }

    getSprite(spriteID, remap = -1) {
        let spriteIndex = this.sty.getSpriteIndex(spriteID);
        if(!spriteIndex) {
            console.error(`Sprite ${spriteID} not found!`);
            return null;
        }
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

    getSpriteDelta(spriteID, deltaData, remap = -1) {
        let spriteIndex = this.sty.getSpriteIndex(spriteID);
        if(!spriteIndex) {
            console.error(`Sprite ${spriteID} not found!`);
            return null;
        }
        let width = spriteIndex.size[0];
        let height = spriteIndex.size[1];
        let spritePos = this.sty.getSpritePixelPos(spriteIndex.ptr);
        let palID = (remap == -1) ? this.sty.getPPaletteID('sprite', spriteID) : remap;
        let pal = this.sty.getPPalette(palID);

        const imgData = new ImageData(width, height);
        let ptr = 0;
        for(let d = 0; d < deltaData.length; d++) {
            ptr += deltaData[d].offset;
            let x = (ptr) % 256;
            let y = ~~((ptr)/256);
            let pixel = y * width + x;

            let data = deltaData[d].data
            for(let p = 0; p < deltaData[d].size; p++) {
                imgData.data[(pixel+p)*4+0] = pal[data[p]*4+2];
                imgData.data[(pixel+p)*4+1] = pal[data[p]*4+1];
                imgData.data[(pixel+p)*4+2] = pal[data[p]*4+0];
                imgData.data[(pixel+p)*4+3] = 255 - pal[data[p]*4+3];
            }

            ptr += deltaData[d].size;
        }

        return {
            imgData, 
            pos: spritePos,
            index: spriteIndex,
        };
    }

    combineLayers(layers, width, height) {
        const outImgData = new ImageData(width, height);

        for(let l = 0; l < layers.length; l++) {
            let layer = layers[l];
            
            for(let p = 0; p < layer.imgData.data.length/4; p++) {
                let x = p % layer.width;
                let y = ~~(p/layer.width);
                let outX = layer.x + (x * (layer.flipX ? -1 : 1)) + (layer.flipX ? layer.width-1 : 0);
                let outY = layer.y + (y * (layer.flipY ? -1 : 1)) + (layer.flipY ? layer.height-1 : 0);
                let outP = outY*width+outX;

                if(outX < 0 || outX >= width || outY < 0 || outY >= height) continue;
                let data = layer.imgData.data;
                if(data[p*4+3] == 0) continue;
                if(data[p*4+0] + data[p*4+1] + data[p*4+2] == 0) continue;
                outImgData.data[outP*4+0] = layer.imgData.data[p*4+0];
                outImgData.data[outP*4+1] = layer.imgData.data[p*4+1];
                outImgData.data[outP*4+2] = layer.imgData.data[p*4+2];
                outImgData.data[outP*4+3] = layer.imgData.data[p*4+3];
            }
        }

        return outImgData;
    }

    renderSprite(canvas, spriteID, remap = -1, x = 0, y = 0) {
        const spriteIndex = this.sty.getSpriteIndex(spriteID);
        canvas.width = spriteIndex.size[0];
        canvas.height = spriteIndex.size[1];

        const ctx = canvas.getContext('2d');
        const spriteData = this.getSprite(spriteID, remap);

        ctx.putImageData(spriteData.imgData, x, y);
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

        for(let i = 0; i < carsInfo.length; i++) {
            if(carsInfo[i].sprite) {
                lastSpriteID++;
                lastSpriteData = this.getCarSprite(lastSpriteID, -1, null, true, lastSpriteID, carsInfo[i].model);
            }

            let y = 0;
            let x = currentX - (lastSpriteData.index.size[0] - carsInfo[i].width)/2
            ctx.putImageData(lastSpriteData.imgData, x, y);
            currentX += carsInfo[i].width + 16;
        }
    }

    renderCarSel(canvas, carID, remap = -1, showTurret = false, showHitbox = false) {
        let carSprite = this.getCarSprite(carID, remap, null, showTurret);
    
        canvas.width = carSprite.index.size[0];
        canvas.height = carSprite.index.size[1];
        let ctx = canvas.getContext('2d');

        ctx.putImageData(carSprite.imgData, 0, 0);
        
        if(showHitbox) {
            this.renderCarHitbox(canvas, carID);
        }
    }

    getCarSprite(carID, remap = -1, deltaData, showTurret = false, customSpriteID = -1, customCarModel = -1) {
        let carModel = (customCarModel+1) ? customCarModel : this.sty.getCarInfo(carID).model;
        let carSpriteID = (customSpriteID+1) ? customSpriteID : this.sty.getCarSpriteID(carID);
        let carSprite = this.getSprite(carSpriteID, remap);
        let carHeight = carSprite.index.size[1];

        if(!showTurret && !deltaData) return carSprite;

        let layers = [
            {
                imgData: carSprite.imgData, 
                x: 0, y: 0, 
                width: carSprite.index.size[0], height: carSprite.index.size[1]
            },
        ];

        if(deltaData) {
            let deltaSprite = this.getSpriteDelta(carSpriteID, deltaData, remap);

            layers.push({
                imgData: deltaSprite.imgData,
                x: 0, y: 0, 
                width: carSprite.index.size[0], height: carSprite.index.size[1],
            });
        }
        
        if(showTurret) (() => {
            let turretInfo = carTurrets[carModel];
            if(!turretInfo) return;

            let turretSpriteID = this.sty.getSpriteBase('code_obj') + turretInfo.objID;
            let turretSprite = this.getSprite(turretSpriteID, -1, true);
            if(!turretSprite) return;

            let turretX = ~~(carSprite.index.size[0]/2 + turretInfo.xOff - turretSprite.index.size[0]/2);
            let turretY = ~~(carSprite.index.size[1]/2 + turretInfo.yOff - turretSprite.index.size[1]/2);

            if(turretY+turretSprite.index.size[1] > carHeight) carHeight = turretY+turretSprite.index.size[1];

            layers.push({
                imgData: turretSprite.imgData,
                x: turretX, y: turretY, 
                width: turretSprite.index.size[0], height: turretSprite.index.size[1], 
                flipX: turretInfo.flip, flipY: turretInfo.flip
            });
        })();

        if(layers.length == 1) return carSprite;

        // overwrite
        carSprite.imgData = this.combineLayers(layers, carSprite.index.size[0], carHeight);
        carSprite.index.size[1] = carHeight;

        return carSprite;
    }

    renderCarDeltas(canvas, carID, remap = -1, overlayMode = 0) {
        let carSpriteID = this.sty.getCarSpriteID(carID);
        let carDeltas = this.sty.getSpriteDeltas(carSpriteID);
        let carSpriteSize = this.sty.getSpriteIndex(carSpriteID).size;
        let carInfo = this.sty.getCarInfo(carID);

        canvas.width = carSpriteSize[0] * carDeltas.length;
        canvas.height = carSpriteSize[1];
        if(carDeltas.length == 0) return;

        let ctx = canvas.getContext('2d');
        for(let i = 0; i < carDeltas.length; i++) {
            let sprite;
            if(overlayMode) {
                sprite = this.getCarSprite(carID, remap, carDeltas[i], false, carSpriteID);
            } else {
                sprite = this.getSpriteDelta(carSpriteID, carDeltas[i], remap);
            }
            ctx.putImageData(sprite.imgData, i*carSpriteSize[0], 0);
        }
    }

    renderCarHitbox(canvas, carID) {
        const carInfo = this.sty.getCarInfo(carID);
        const carSpriteID = this.sty.getCarSpriteID(carID);
        const carSpriteIndex = this.sty.getSpriteIndex(carSpriteID);

        let ctx = canvas.getContext('2d');
        ctx.lineWidth = 1;
        let cx = ~~(carSpriteIndex.size[0]/2);
        let cy = ~~(carSpriteIndex.size[1]/2);
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

    renderFontCharList(canvas, fontBase, fontSize) {
        let fontSpriteBase = this.sty.getSpriteBase('font') + fontBase;
        let totalWidth = 0;
        let maxHeight = 0;

        for(let i = 0; i < fontSize; i++) {
            let charSpriteID = fontSpriteBase + i;
            let charSpriteIndex = this.sty.getSpriteIndex(charSpriteID);
            totalWidth += charSpriteIndex.size[0];
            maxHeight = Math.max(maxHeight, charSpriteIndex.size[1]);
        }

        canvas.width = totalWidth;
        canvas.height = maxHeight;
        let ctx = canvas.getContext('2d');

        let currentX = 0;
        for(let i = 0; i < fontSize; i++) {
            let charSpriteID = fontSpriteBase + i;
            let charSprite = this.getSprite(charSpriteID, -1);
            ctx.putImageData(charSprite.imgData, currentX, 0);
            currentX += charSprite.index.size[0];
        }
    }
}