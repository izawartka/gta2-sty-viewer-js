export class OMPalette {
    constructor(pageID, relID, data) {
        this.data = data;
        this.pageID = pageID;
        this.relID = relID;
        this.id = pageID*64 + relID;
    }

    getColor(i) {
        return this.data.slice(i*4, i*4+4);
    }

    getBGRAData() {
        let data = [];
        for(let i = 0; i < 256; i++) {
            let color = this.getColor(i);
            data.push(color[2], color[1], color[0], color[3]);
        }
        return data;
    }
}