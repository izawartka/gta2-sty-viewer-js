export class DataChunk {
    constructor(name, data) {
        Object.assign(this, {name, data});

        const types = {
            'TILE': this.readAsTILE,
            'PALB': this.readAsPALB,
            'PPAL': this.readAsPPAL,
            'PALX': this.readAsPALX,
            'SPRX': this.readAsSPRX,
            'SPRG': this.readAsSPRG,
            'SPRB': this.readAsSPRB,
            'RECY': this.readAsRECY,
            'OBJI': this.readAsOBJI,
            'FONB': this.readAsFONB,
            'SPEC': this.readAsSPEC,
            'CARI': this.readAsCARI,
        };

        if(!Object.keys(types).includes(name)) {
            console.warn(`Unknown DataChunk type: ${name}`);
            return;
        }

        types[name].apply(this);
    }

    readAsTILE() {
        this.pages = [];

        for(let i = 0; i < this.data.byteLength; i+=256*256) {
            let pageData = new Uint8Array(this.data, i, 256*256);
            let tiles = [];

            for(let r = 0; r < 4*64*4; r++) {
                let tileID = (~~(r/(64*4)))*4 + (~~(r%4));
                if(!tiles[tileID]) tiles[tileID] = [];
                tiles[tileID].push(...pageData.slice(r*64, r*64+64));
            }

            this.pages.push(tiles);
        }
    }

    readAsPALB() {
        const basesNames = [
            'tile',
            'sprite',
            'car_remap',
            'ped_remap',
            'code_obj_remap',
            'map_obj_remap',
            'user_remap',
            'font_remap'
        ];

        this.paletteBases = {};
        let basesArray = new Uint16Array(this.data);

        let sum = 0;
        for(let i = 0; i < 8; i++) {
            this.paletteBases[basesNames[i]] = sum;
            sum += basesArray[i];
        }
    }

    readAsPPAL() {
        this.pages = [];

        for(let i = 0; i < this.data.byteLength; i+=256*256) {
            let pageData = new Uint8Array(this.data, i, 256*256);
            let palettes = [];

            for(let p = 0; p < 256*64; p++) {
                let paletteID = p%64;
                if(!palettes[paletteID]) palettes[paletteID] = [];
                palettes[paletteID].push(...pageData.slice(p*4, p*4+4));
            }

            this.pages.push(palettes);
        }
    }

    readAsPALX() {
        this.virtualPalettes = Array.from(new Uint16Array(this.data));
    }

    readAsSPRX() {
        this.spriteIndexes = [];

        for(let i = 0; i < ~~(this.data.byteLength/8); i++) {
            let indexData = this.data.slice(i*8, i*8+8);
            let index = {
                ptr: new Uint32Array(indexData, 0)[0],
                size: new Uint8Array(indexData, 4, 2),
                pad: new Uint16Array(indexData, 6)[0]
            }

            this.spriteIndexes[i] = index;
        }
    }

    readAsSPRG() {
        this.pages = [];

        for(let i = 0; i < this.data.byteLength; i+=256*256) {
            let pageData = new Uint8Array(this.data, i, 256*256);
            this.pages.push(pageData);
        }
    }

    readAsSPRB() {
        const basesNames = [
            'car',
            'ped',
            'code_obj',
            'map_obj',
            'user',
            'font',
        ];

        this.spriteBases = {};
        let basesArray = new Uint16Array(this.data);

        let sum = 0;
        for(let i = 0; i < 6; i++) {
            this.spriteBases[basesNames[i]] = sum;
            sum += basesArray[i];
        }
    }

    readAsRECY() {
        let info = Array.from(new Uint8Array(this.data));
        info.splice(info.indexOf(255));
        this.recyclingInfo = info;
    }

    readAsOBJI() {
        this.objectsInfo = [];
        let infoArray = new Uint8Array(this.data)

        for(let i = 0; i < this.data.byteLength; i+=2) {
            const info = {
                model: infoArray[i],
                sprites: infoArray[i+1]
            }

            this.objectsInfo.push(info);
        }
    }

    readAsFONB() {
        let bases = Array.from(new Uint16Array(this.data));
        this.fontsCount = bases.shift();
        this.fontBases = [];
        let sum = 0;
        bases.forEach((base, id) => {
            this.fontBases[id] = sum;
            sum += base;
        })
    }

    readAsSPEC() {
        let material = 0;
        this.materials = [];
        let values = Array.from(new Uint16Array(this.data));
        values.forEach(value => {
            if(value == 0) {
                material++;
                return;
            }

            this.materials[value] = material;
        })
    }

    readAsCARI() {
        this.carsInfo = [];
        let b = 0;
        while(b < this.data.byteLength) {
            let remapsCount = new Uint8Array(this.data, b+4, 1)[0];
            let doorsCount = new Uint8Array(this.data, b+14+remapsCount, 1)[0];
            let dataSize = 15 + doorsCount*2 + remapsCount;
            let carData = new Uint8Array(this.data, b, dataSize);
            let carInfo = {};
            const infoKeys = [
                'model', 'sprite',
                'width', 'height',
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
            })
            carInfo.remaps = Array.from(new Uint8Array(this.data, b+14, remapsCount));
            carInfo.doors = [];
            let doors = Array.from(new Int8Array(this.data, b+15+remapsCount, doorsCount*2));
            for(let d = 0; d < doors.length; d+=2) {
                carInfo.doors.push({
                    x: doors[d], 
                    y: doors[d+1]
                });
            }

            this.carsInfo.push(carInfo);
            b+=dataSize;
        }
    }
}