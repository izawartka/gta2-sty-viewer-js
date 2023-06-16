export class OMPalette {
    constructor(pageID, relID, bgraData) {
        this.pageID = pageID;
        this.relID = relID;
        this.id = pageID*64 + relID;
        this.usedBy = [];

        this.setData(bgraData);
    }

    setData(bgraData) {
        this.data = [];
        for(let i = 0; i < 256; i++) {
            let bgraColor = bgraData.slice(i*4, i*4+4);
            this.data.push(bgraColor[2], bgraColor[1], bgraColor[0], 255 - bgraColor[3]);
        }
    }

    getColor(i) {
        return this.data.slice(i*4, i*4+4);
    }

    getBGRAData() {
        let data = [];
        for(let i = 0; i < 256; i++) {
            let rgbaColor = this.getColor(i);
            data.push(rgbaColor[2], rgbaColor[1], rgbaColor[0], 255 - rgbaColor[3]);
        }
        return data;
    }

    addUsage(vpal) {
        if(!this.usedBy.includes(vpal)) {
            this.usedBy.push(vpal);
        }
    }

    removeUsage(vpal) {
        this.usedBy.splice(this.usedBy.indexOf(vpal), 1);
    }

    getUsageGroupedIDs() {
        let grouped = {};

        for(let i = 0; i < this.usedBy.length; i++) {
            let vPal = this.usedBy[i];
            if(!grouped[vPal.baseName]) grouped[vPal.baseName] = [];
            grouped[vPal.baseName].push(vPal.relID);
        }

        return grouped;
    }
}