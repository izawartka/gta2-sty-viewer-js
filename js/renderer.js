import { carTurrets, options } from "./constants.js";

export class Renderer {
    constructor(sty) {
        this.sty = sty;
        this.cachedPalCanv = null;
    }

    renderBitmap(canvas, bitmap, customPalette = null) {
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');

        ctx.putImageData(bitmap.getImgData(customPalette), 0, 0);
    }

    getRelativePos(canvas, e) {
        const rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        return {x, y};
    }

    combineLayers(layers, width, height) {
        const layersCount = layers.length;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.save();
        canvas.width = width;
        canvas.height = height;

        for(let i = 0; i < layersCount; i++) {
            const layerCanvas = document.createElement('canvas');
            layerCanvas.width = layers[i].width;
            layerCanvas.height = layers[i].height;
            layerCanvas.getContext('2d').putImageData(layers[i].imgData, 0, 0);

            if(layers[i].rot != 0) {
                let cx = layers[i].width>>1;
                let cy = layers[i].height>>1;
                ctx.translate(layers[i].x+cx, layers[i].y+cy);
                ctx.rotate(layers[i].rot);
                ctx.translate(-layers[i].x-cx, -layers[i].y-cy);
            }
            ctx.drawImage(layerCanvas, layers[i].x, layers[i].y);
            ctx.restore();
            layerCanvas.remove();
        }

        const imgData = ctx.getImageData(0, 0, width, height);
        canvas.remove();
        return imgData;
    }

    applyDelta(bitmap, delta, changesOnly = false) {
        const out = bitmap.clone();
        if(changesOnly) out.data.fill(0);

        let p = 0;
        for(let i = 0; i < delta.length; i++) {
            p += delta[i].offset;
            let size = delta[i].data.length;
            for(let j = 0; j < size; j++) {
                let ptr = (p>>8)*out.width + (p%256);
                out.data[ptr] = delta[i].data[j];
                p++;
            }
        }
        return out;
    }

    ////////////////////////////////

    renderTilesList(canvas) {
        let tilesCount = this.sty.data.tiles.length;
        let pagesCount = Math.ceil(tilesCount/16);
        canvas.width = 256 * pagesCount;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        for(let i = 0; i < tilesCount; i++) {
            let x = ~~(i/16)*4+(i%4);
            let y = ~~(i/4)%4;
            let imgData = this.sty.data.tiles[i].bitmap.getImgData();

            ctx.putImageData(imgData, x*64, y*64);
        }
    }

    getPointedTileID(canvas, e) {
        let pos = this.getRelativePos(canvas, e);
        let pageID = ~~(pos.x / 256);
        let tileIDinPage = ~~((pos.x % 256)/64) + (~~(pos.y/64))*4;

        return pageID*16+tileIDinPage;
    }

    renderSpritesList(canvas) {
        canvas.width = 256 * this.sty.data.spritePagesCount;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        const sprites = this.sty.getSpritesAsArray();
        for(let i = 0; i < sprites.length; i++) {
            let x = ~~sprites[i].absX
            let y = ~~sprites[i].y;
            let imgData = sprites[i].bitmap.getImgData();
            ctx.putImageData(imgData, x, y);
        }
    }

    getPointedSprite(canvas, e) {
        const sprites = this.sty.getSpritesAsArray();
        let pos = this.getRelativePos(canvas, e);
        let page = ~~(pos.x / 256);

        for(let i = 0; i < sprites.length; i++) {
            if(sprites[i].pageID != page) continue;
            if(pos.y < sprites[i].y) continue;
            if(pos.y > sprites[i].y+sprites[i].bitmap.height) continue;
            if(pos.x < sprites[i].absX) continue;
            if(pos.x > sprites[i].absX+sprites[i].bitmap.width) continue;
            return sprites[i];
        }
    }

    renderCarsList(canvas) {
        const cars = this.sty.data.cars;
        const carsCount = cars.length;
        let totalWidth = 0;
        for(let i = 0; i < carsCount; i++) {
            totalWidth += cars[i].width + options.carsListMargin;
        }

        canvas.width = totalWidth;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        let x = 0;
        for(let i = 0; i < carsCount; i++) {
            let leftMargin = ~~((cars[i].sprite.bitmap.width - cars[i].width)/2);
            let imgData = this.getCarImgData(cars[i], null, true)
            ctx.putImageData(imgData, x-leftMargin, 0);
            x += cars[i].width + options.carsListMargin;
        }
    }

    getPointedCar(canvas, e) {
        const pos = this.getRelativePos(canvas, e);
        const cars = this.sty.data.cars;
        const carsCount = cars.length;

        let sumx = 0;
        for(let i = 0; i < carsCount; i++) {
            sumx += cars[i].width + options.carsListMargin;
            if(sumx > pos.x) return cars[i];
        }

        return null;
    }

    getCarImgData(car, remap = null, showTurret = false, deltaID = -1, deltaChangesOnly = false) {
        let bitmap = car.sprite.bitmap;
        let width = bitmap.width;
        let height = bitmap.height;

        let deltaData = car.sprite.deltas[deltaID];
        if(deltaData) bitmap = this.applyDelta(bitmap, deltaData, deltaChangesOnly);

        const layers = [
            {
                imgData: bitmap.getImgData(remap),
                x: 0, y: 0,
                width, height,
                rot: 0
            }
        ];
        
        if(showTurret) (() => {
            let turretInfo = carTurrets[car.model];
            if(!turretInfo) return;
            const turretSprite = this.sty.data.sprites['code_obj'][turretInfo.objID];
            if(!turretSprite) return;

            let turWidth = turretSprite.bitmap.width;
            let turHeight = turretSprite.bitmap.height;
            let turX = ((width-turWidth) >> 1)+turretInfo.xOff;
            let turY = ((height-turHeight) >> 1)+turretInfo.yOff;
            if(turHeight + turY > height) height = turHeight + turY; /// temp to fix the tank

            layers.push({
                imgData: turretSprite.bitmap.getImgData(),
                x: turX,
                y: turY,
                width: turWidth,
                height: turHeight,
                rot: turretInfo.rot
            });
        })();

        return this.combineLayers(layers, width, height);
    }

    renderCarSel(canvas, car, remap = null, showTurret = false, showHitbox = false) {
        let imgData = this.getCarImgData(car, remap, showTurret);
        canvas.width = imgData.width;
        canvas.height = imgData.height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(imgData, 0, 0);

        if(!showHitbox) return;
        this.renderCarHitbox(canvas, car);
    }

    renderCarHitbox(canvas, car) {
        let ctx = canvas.getContext('2d');
        ctx.lineWidth = 1;
        let cx = car.sprite.bitmap.width >> 1;
        let cy = car.sprite.bitmap.height >> 1;
        let corx = (cx - (car.width >> 1)) + .5;
        let cory = (cy - (car.height >> 1)) + .5;

        ctx.strokeStyle = '#f88';
        ctx.strokeRect(corx, cy+car.rearWheelOffset+.5, car.width-1, car.frontWheelOffset-car.rearWheelOffset-1);
        ctx.strokeStyle = '#88f';
        ctx.strokeRect(corx, cy+car.rearWindowOffset+.5, car.width-1, car.frontWindowOffset-car.rearWindowOffset-1);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(corx, cory, car.width-1, car.height-1);
        ctx.fillStyle = '#0f08';
        for(let i = 0; i < car.doors.length; i++) {
            let door = car.doors[i];
            ctx.beginPath();
            ctx.arc(cx+door.x, cy+door.y, 3, 0, 2*Math.PI);
            ctx.fill();
        }
    }

    renderCarDeltasList(canvas, car, remap = null, changesOnly = false) {
        let deltas = car.sprite.deltas;
        let deltasCount = deltas.length;
        let xDiff = car.sprite.bitmap.width + options.deltasListMargin;

        let totalWidth = 0;
        for(let i = 0; i < deltasCount; i++) {
            totalWidth += xDiff
        }

        canvas.width = totalWidth;
        canvas.height = car.sprite.bitmap.height;
        const ctx = canvas.getContext('2d');

        let x = 0;
        for(let i = 0; i < deltasCount; i++) {
            let imgData = this.getCarImgData(car, remap, false, i, changesOnly);
            ctx.putImageData(imgData, ~~x, 0);
            x += xDiff
        }
    }

    renderPalettesList(canvas, xMarker = -1) {
        if(!this.cachedPalCanv) this.cachePalettesList();

        canvas.width = this.cachedPalCanv.width;
        canvas.height = this.cachedPalCanv.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.cachedPalCanv, 0, 0);

        if(xMarker == -1) return;
        let xScale = options.palettesListScale;
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.strokeRect(xMarker*xScale-.5, -.5, xScale+1, canvas.height+1);
    }

    cachePalettesList() {
        let palettesCount = this.sty.data.palettes.length;
        let xScale = options.palettesListScale;
        this.cachedPalCanv = document.createElement('canvas');
        this.cachedPalCanv.height = 256 + options.palettesListUsedSize;
        this.cachedPalCanv.width = palettesCount * xScale;
        let ctx = this.cachedPalCanv.getContext('2d');
        
        for(let i = 0; i < palettesCount; i++) {
            let pal = this.sty.data.palettes[i].data;
            let imgData = ctx.createImageData(1, 256);
            for(let p = 0; p < 256*4; p++) {
                imgData.data[p] = pal[p];
            }
            for(let j = 0; j < xScale; j++)
                ctx.putImageData(imgData, i*xScale+j, options.palettesListUsedSize);

            let palUsage = this.sty.getPaletteUsage(this.sty.data.palettes[i]);
            if(Object.values(palUsage).length == 0) continue;
            ctx.fillStyle = options.palettesListUsedColor;
            ctx.fillRect(i*xScale, 0, xScale, options.palettesListUsedSize);
        }
    }

    renderPaletteSel(canvas, palette, xMarker = -1) {
        let scale = options.paletteSelScale;
        canvas.width = 256 * scale;
        canvas.height = 24;
        const ctx = canvas.getContext('2d');

        for(let p = 0; p < 256; p++) {
            let pixel = palette.getColor(p);
            ctx.fillStyle = `rgba(${pixel.join(', ')})`;
            ctx.fillRect(p*scale, 0, scale, canvas.height);
        }

        if(xMarker == -1) return;
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.strokeRect(xMarker*scale-.5, -.5, scale+1, canvas.height+1);
    };

    getPointedFromX(canvas, e, scale = 4) {
        let rect = canvas.getBoundingClientRect();
        let curX = e.clientX - rect.left;
        let id = ~~((curX * canvas.width) / (rect.width * scale));
        return id;
    }

    renderFontCharList(canvas, font) {
        let fontSize = font.sprites.length;
        let totalWidth = 0;
        let maxHeight = 0;

        for(let i = 0; i < fontSize; i++) {
            let bitmap = font.sprites[i].bitmap;
            totalWidth += bitmap.width;
            maxHeight = Math.max(maxHeight, bitmap.height);
        }

        canvas.width = totalWidth;
        canvas.height = maxHeight;
        let ctx = canvas.getContext('2d');

        let x = 0;
        for(let i = 0; i < fontSize; i++) {
            let bitmap = font.sprites[i].bitmap;
            ctx.putImageData(bitmap.getImgData(), x, 0);
            x += bitmap.width;
        }
    }
}