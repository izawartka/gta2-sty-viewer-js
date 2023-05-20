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

    getRGBAColor(i) {
        let color = this.getColor(i);
        return [color[2], color[1], color[0], 255-color[3]];
    }
}