import {DataChunk} from './datachunk.js';

export class STY {
    constructor(binaryData) {
        this.data = {};

        this.header = String.fromCharCode.apply(String, new Uint8Array(binaryData, 0, 4));
        this.fileVersion = new Uint16Array(binaryData, 4, 1)[0];

        if(!this.isFileCorrect()) return;

        let i = 6;
        while(i < binaryData.byteLength) {
            
            let header = binaryData.slice(i, i+8);
            let name = String.fromCharCode.apply(String, new Uint8Array(header, 0, 4));
            let size = new Uint32Array(header, 4, 1)[0];
            let chunk = binaryData.slice(i+8, i+8+size);
            this.data[name] = new DataChunk(name, chunk);
            i+=size+8;
        }
    }

    isFileCorrect() {
        if(this.header != 'GBST') {
            console.warn(`Incorrect STY header: ${this.header}`);
            return false;
        }
        if(this.fileVersion != 700) {
            console.warn(`Incorrect STY version: ${this.fileVersion}`);
            return false;
        }
        return true;
    }

    getVPaletteID(baseName, objID) {
        let palOffset = this.data['PALB'].paletteBases[baseName];
        if(palOffset == undefined) {
            console.warn(`Incorrect palette base name: ${baseName}`);
            return 0;
        }
        return palOffset+objID;
    }

    getPPaletteID(baseName, objID) {
        let virtID = this.getVPaletteID(baseName, objID);
        let palID = this.data['PALX'].virtualPalettes[virtID];
        return palID;
    }

    getPPalette(paletteID) {
        return this.data['PPAL'].pages[~~(paletteID/64)][paletteID%64];
    }

    getTile(pageID, tileIDinPage) {
        return this.data['TILE'].pages[pageID][tileIDinPage];
    }

    getTileByID(tileID) { 
        return this.data['TILE'].pages[~~(tileID/64)][tileID%64];
    }

    getAllTilesArray() {
        let tiles = [];
        this.data['TILE'].pages.forEach(page => {
            tiles.push(...page);
        })
        return tiles;
    }

    getAllPPalettesArray() {
        let palettes = [];
        this.data['PPAL'].pages.forEach(page => {
            palettes.push(...page);
        })
        return palettes;
    }

    getSpritesCount() {
        return this.data['SPRX'].spriteIndexes.length;
    }

    getTilePagesArray() {
        return this.data['TILE'].pages;
    }

    getPPalettePagesCount() {
        return this.data['PPAL'].pages.length
    }

    getSpriteIndex(id) {
        let index = this.data['SPRX'].spriteIndexes[id];
        if(!index) console.warn(`Incorrect sprite ID: ${id}`);
        return JSON.parse(JSON.stringify(index));
    }

    getSpritePixelPos(ptr) {
        let page = ~~(ptr / (256*256));
        let ptrPage = ptr%(256*256);
        let x = ptrPage % 256;
        let y = ~~(ptrPage / 256);
        return { page, x, y, absX: page * 256 + x};
    }

    getSpritePixel(page, x, y) {
        let ptr = y * 256 + x;
        return this.data['SPRG'].pages[page][ptr];
    }

    getSpriteIDByPos(x, y) {
        for(let s = 0; s < this.getSpritesCount(); s++) {
            let index = this.data['SPRX'].spriteIndexes[s];
            let pos = this.getSpritePixelPos(index.ptr);
            if(x < pos.absX) continue;
            if(y < pos.y) continue;
            if(~~(x / 256) != pos.page) continue;
            
            if(x > pos.absX + index.size[0]) continue;
            if(y > pos.y + index.size[1]) continue;

            return s
        }

        return -1;
    }

    getMaterialName(tileID) {
        const materialNames = [
            'GRASS_DIRT',
            'ROAD_SPECIAL',
            'WATER',
            'ELECTRIFIED',
            'ELECTRIFIED_PLATFORM',
            'WOOD',
            'METAL',
            'METAL_WALL',
            'GRASS_DIRT_WALL',
            'INFER'
        ];

        let materialID = this.data['SPEC'].materials[tileID];
        if(materialID == undefined) return '';
        return materialNames[materialID];
    }

    getSpriteType(spriteID) {
        let typeid = 0;
        while (Object.values(this.data['SPRB'].spriteBases)[typeid] <= spriteID) {
            typeid++;
        }

        return Object.keys(this.data['SPRB'].spriteBases)[typeid-1];
    }

    getSpriteBase(type) {
        return this.data['SPRB'].spriteBases[type];
    }

    getAllSpriteBases() {
        return this.data['SPRB'].spriteBases;
    }

    getAllPalBases() {
        return this.data['PALB'].paletteBases;
    }

    getAllCarsInfo() {
        return this.data['CARI'].carsInfo;
    }

    getCarInfo(id) {
        return this.data['CARI'].carsInfo[id];
    }

    getCarSpriteID(carID) {
        let spriteID = this.data['CARI'].carsInfo[carID].spriteID;
        let spriteBase = this.data['SPRB'].spriteBases['car'];
        return spriteID + spriteBase;
    }

    getCarRecycled(carModel) {
        return this.data['RECY'].recyclingInfo.includes(carModel);
    }

    getPPalUsage(paletteID) {
        let usage = {};
        let palb = Object.entries(this.data['PALB'].paletteBases);
        let vpalL = this.data['PALB'].totalLength;

        this.data['PALX'].virtualPalettes.forEach((ppal, vpal) => {
            if(ppal != paletteID) return;
            if(vpal >= vpalL) return;

            for(let i = 1; i <= palb.length; i++) {
                if(palb[i] && vpal >= palb[i][1]) continue;

                let baseName = palb[i-1][0];
                if(!usage[baseName]) usage[baseName] = [];
                usage[baseName].push(vpal - palb[i-1][1]);
                break;
            }
        });
        return usage;
    }

    getAllFontBases() {
        return this.data['FONB'].fontBases;
    }

    getAllFontSizes() {
        let fonb = this.data['FONB'].fontBases;
        return fonb.map((base, i) => {
            if(i == fonb.length-1) return this.data['FONB'].totalLength - base;
            return fonb[i+1] - base;
        });
    }

    // this code begs for refactoring
    getSpriteDeltas(spriteID) {
        let index = this.data['DELX'].deltaIndexes.filter(index => index.spriteID == spriteID)[0];
        if(!index) return [];

        let deltas = [[]];

        let currentDelta = 0;
        let db = 0;
        let b = 0;
        let i = this.data['DELS'].deltaPtrs[index.ptr];
        while(b < index.totalSize) {
            if(db >= index.deltaSizes[currentDelta]) {
                currentDelta++;
                deltas.push([]);
                db = 0;
            }
            
            let delta = this.data['DELS'].deltas[i];
            deltas[currentDelta].push(delta);
            b+=delta.size+3;
            db+=delta.size+3;
            i++;
        }

        return deltas;
    }
}