import { OMBitmap } from "./bitmap.js";

export class OMTile {
    constructor(id, pageID, relID, data, virtualPalette, material) {
        this.id = id;
        this.pageID = pageID;
        this.relID = relID;
        this.bitmap = new OMBitmap(data, 64, 64, virtualPalette);
        this.material = null;
    }
}