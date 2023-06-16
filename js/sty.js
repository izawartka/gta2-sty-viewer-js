import { OMPalette } from './model/palette.js';
import { OMVirtualPalette } from './model/virtualPalette.js';
import { OMTile } from './model/tile.js';
import { OMSprite } from './model/sprite.js';
import { OMCar } from './model/car.js';
import { OMFont } from './model/font.js';
import { paletteBases, spriteBases } from './constants.js';

export class STY {
    constructor(binaryData) {
        this.chunks = {};
        this.data = {};

        this.header = String.fromCharCode.apply(String, new Uint8Array(binaryData, 0, 4));
        this.fileVersion = new Uint16Array(binaryData, 4, 1)[0];

        if(!this.isFileCorrect()) return;

        let i = 6;
        while(i < binaryData.byteLength) {
            
            let header = binaryData.slice(i, i+8);
            let name = String.fromCharCode.apply(String, new Uint8Array(header, 0, 4));
            let size = new Uint32Array(header, 4, 1)[0];
            let data = binaryData.slice(i+8, i+8+size);
            this.chunks[name] = data;
            i+=size+8;
        }

        this.createObjectModel();
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
    
    createObjectModel() {
        let palettes = this.parsePalettes();
        let virtualPalettes = this.parseVirtualPalettes(palettes);
        let tiles = this.parseTiles(virtualPalettes);
        let spritePages = this.parseSpritePages();
        let spriteIndexes = this.parseSpriteIndexes();
        let sprites = this.parseSprites(spritePages, spriteIndexes, virtualPalettes);
        let cars = this.parseCars(sprites, virtualPalettes);
        let fonts = this.parseFonts(sprites);

        this.parseMaterials(tiles);
        this.parseCarDeltas(sprites);
        this.parseRecycling(cars);

        this.data = {
            palettes,
            virtualPalettes,
            tiles,
            sprites,
            spritePagesCount: spritePages.length,
            cars,
            fonts,
        };
    }

    parsePalettes() {
        let PPAL = this.chunks['PPAL'];
        let palData = this.readPagedContent(PPAL, 256, 256, 4, 256);
        
        return palData.map((data) => {
            return new OMPalette(
                data.pageID,
                data.relID,
                data.data
            );
        });
    }

    parseVirtualPalettes(physicalPalettes) {
        let PALX = this.chunks['PALX'];
        let PALB = this.chunks['PALB'];

        let unorderedVPals = new Uint16Array(PALX);
        let bases = new Uint16Array(PALB);
        let vPals = {};

        this.mapBases(unorderedVPals, bases, paletteBases, (value, baseName, relID) => {
            let vPal = new OMVirtualPalette(
                baseName,
                relID,
                physicalPalettes[value]
            );
            physicalPalettes[value].addUsage(vPal);

            if(!vPals[baseName]) vPals[baseName] = [];
            vPals[baseName][relID] = vPal;

        });

        return vPals;
    }

    parseMaterials(tiles) {
        let SPEC = this.chunks['SPEC'];
        if(!SPEC) return;
        let data = new Uint16Array(SPEC);

        let material = 0;
        for(let i = 0; i < data.length; i++) {
            if(data[i] == 0) {
                material++;
                continue;
            }

            tiles[data[i]].material = material;
        }
    }

    parseTiles(virtualPalettes) {
        let TILE = this.chunks['TILE'];
        if(!TILE) return [];
        let tilesData = this.readPagedContent(TILE, 256, 256, 64, 64);

        return tilesData.map((data, id) => {
            return new OMTile(
                id,
                data.pageID,
                data.relID,
                data.data,
                virtualPalettes['tile'][id]
            );
        });
    }

    parseSpritePages() {
        let SPRG = this.chunks['SPRG'];
        if(!SPRG) return [];
        let pages = [];

        for(let i = 0; i < SPRG.byteLength; i+=256*256) {
            let pageData = new Uint8Array(SPRG, i, 256*256);
            pages.push(pageData);
        }

        return pages;
    }

    parseSpriteIndexes() {
        let SPRX = this.chunks['SPRX'];
        if(!SPRX) return [];
        let indexes = [];

        for(let i = 0; i < ~~(SPRX.byteLength/8); i++) {
            let indexData = SPRX.slice(i*8, i*8+8);
            let size = new Uint8Array(indexData, 4, 2);

            let index = {
                ptr: new Uint32Array(indexData, 0)[0],
                width: size[0],
                height: size[1]
            }

            indexes[i] = index;
        }

        return indexes;
    }

    parseSprites(spritePages, spriteIndexes, virtualPalettes) {
        let SPRB = this.chunks['SPRB'];
        if(!SPRB) return [];
        let bases = new Uint16Array(SPRB);

        let sprites = {};
        this.mapBases(spriteIndexes, bases, spriteBases, (spriteIndex, baseName, relID, absID) => {
            let sprite = new OMSprite(
                baseName,
                relID,
                spriteIndex,
                this.getSpriteData(spritePages, spriteIndex),
                virtualPalettes['sprite'][absID],
            );

            if(!sprites[baseName]) sprites[baseName] = [];
            sprites[baseName][relID] = sprite;
        });

        return sprites;
    }

    parseCarDeltas(sprites) {
        let DELX = this.chunks['DELX'];
        let DELS = this.chunks['DELS'];
        if(!DELX || !DELS) return;

        let b = 0;
        let sb = 0;
        while(b < DELX.byteLength) {
            let spriteID = new Uint16Array(DELX, b, 1)[0];
            let sprite = sprites['car'][spriteID];

            let count = new Uint8Array(DELX, b+2, 1)[0];
            let deltaSizes = Array.from(new Uint16Array(DELX.slice(b+4, b+4+count*2), 0, count));

            for(let i = 0; i < count; i++) {
                let deltas = [];
                let end = sb + deltaSizes[i];
                while(sb < end) {
                    let offset = new Uint16Array(DELS.slice(sb, sb+2), 0, 1)[0];
                    let size = new Uint8Array(DELS, sb+2, 1)[0];
                    deltas.push({
                        offset,
                        data: new Uint8ClampedArray(DELS, sb+3, size)
                    });
                    sb += 3+size;
                }

                if(sprite) {
                    sprite.addDelta(deltas);
                }
            }
            
            b+=4+count*2;
        }
    }

    parseCars(sprites, virtualPalettes) {
        let CARI = this.chunks['CARI'];
        if(!CARI) return [];

        let cars = [];
        let b = 0;
        let id = 0;
        let lastSpriteID = -1;
        while(b < CARI.byteLength) {
            let remapsCount = new Uint8Array(CARI, b+4, 1)[0];
            let doorsCount = new Uint8Array(CARI, b+14+remapsCount, 1)[0];
            let dataSize = 15 + doorsCount*2 + remapsCount;
            let carData = new Uint8Array(CARI, b, dataSize);
            let carInfo = {};
            const infoKeys = [
                'model', 'sprite',
                'w', 'h',
                '', 'passengers',
                'wreck', 'rating',
                'front_wheel_offset',
                'rear_wheel_offset',
                'front_window_offset',
                'rear_window_offset',
                'info_flags',
                'info_flags_2',
            ];
            const signedKeys = [8, 9, 10, 11];
            const flags = [12, 13];

            infoKeys.forEach((key, i) => {
                if(key == '') return;
                let val = carData[i];
                if(signedKeys.includes(i))
                    val = val <<24 >>24;
                if(flags.includes(i)) {
                    val = val.toString(2);
                    while(val.length < 8) {
                        val = '0'+val;
                    }
                    val = val.split('').map(value => value == '1').reverse();
                }
                carInfo[key] = val;
            });
            
            if(carInfo['sprite']) lastSpriteID++;
            const car = new OMCar(id, carInfo, sprites['car'][lastSpriteID]);
            
            let remapsIDs = Array.from(new Uint8Array(CARI, b+14, remapsCount));
            remapsIDs.forEach((remapID) => {
                car.addRemap(virtualPalettes['car_remap'][remapID]);
            });

            let doorsInfo = Array.from(new Int8Array(CARI, b+15+remapsCount, doorsCount*2));
            for(let d = 0; d < doorsInfo.length; d+=2) {
                car.addDoor(doorsInfo[d], doorsInfo[d+1]);
            }

            b+=dataSize;
            id++;

            cars.push(car);
        }

        return cars;
    }

    parseRecycling(cars) {
        let RECY = this.chunks['RECY'];
        if(!RECY) return;
        let recyclingInfo = Array.from(new Uint8Array(RECY));
        let carsByModel = [];
        cars.forEach((car) => {
            carsByModel[car.model] = car;
        });
        recyclingInfo.forEach((model) => {
            if(!carsByModel[model]) return;
            carsByModel[model].recycled = true;
        });
    }

    parseFonts(sprites) {
        let FONB = this.chunks['FONB'];
        if(!FONB) return [];
        let bases = Array.from(new Uint16Array(FONB)).slice(1);
        let fonts = [];

        let sum = 0;
        for(let i = 0; i < bases.length; i++) {
            let fontSprites = sprites['font'].slice(sum, sum+bases[i]);
            fonts[i] = new OMFont(i, fontSprites);
            sum += bases[i];
        }

        return fonts;
    }

    getSpriteData(spritePages, spriteIndex) {
        let pageID = ~~(spriteIndex.ptr/(256*256));
        let relPtr = spriteIndex.ptr%(256*256);
        let spriteData = [];
        for(let i = 0; i < spriteIndex.height; i++) {
            let start = relPtr+i*256;
            let row = spritePages[pageID].slice(start, start+spriteIndex.width);
            spriteData.push(...row);
        }

        return spriteData
    }

    mapBases(unordered, bases, baseNames, cb) {
        let currentID = 0;
        
        for(let i = 0; i < bases.length; i++) {
            let baseName = baseNames[i];

            for(let j = 0; j < bases[i]; j++) {
                cb(unordered[j+currentID], baseName, j, j+currentID);
            }

            currentID += bases[i];
        }
    }

    readPagedContent(data, pageWidth, pageHeight, segmentWidth, segmentHeight) {
        let pagesCount = data.byteLength/(pageWidth*pageHeight);
        let pageSize = pageWidth*pageHeight;
        let segmentsPerPage = pageSize/(segmentWidth*segmentHeight);
        let segmentsWidthCount = ~~(pageWidth/segmentWidth);
        let segments = [];

        for(let i = 0; i < pagesCount; i++) {
            let pageData = new Uint8Array(data, i*pageSize, pageSize);

            for(let j = 0; j < pageSize/segmentWidth; j++) {
                let segX = j%segmentsWidthCount;
                let segY = ~~(j/(segmentsWidthCount*segmentHeight));
                let segID = segY*segmentsWidthCount + segX;
                let segAbsID = i*segmentsPerPage + segID;

                if(!segments[segAbsID]) segments[segAbsID] = {
                    data: [],
                    pageID: i,
                    relID: segID,
                };
                
                segments[segAbsID].data.push(...pageData.slice(j*segmentWidth, j*segmentWidth+segmentWidth));
            }
        }

        return segments;
    }

    ///////////////////////////

    getSpritesAsArray() {
        return Object.values(this.data.sprites)
            .reduce((acc, val) => acc.concat(val), []);
    }
}