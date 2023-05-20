import { OMBitmap } from "./bitmap.js";

export class OMSprite {
    constructor(base, relID, index, data, virtualPalette) {
        this.base = base;
        this.relID = relID;
        [this.pageID, this.x, this.y, this.absX] = this.ptrToLoc(index.ptr);
        this.bitmap = new OMBitmap(data, index.width, index.height, virtualPalette);
        this.deltas = [];
    }

    ptrToLoc(ptr) {
        let pageID = ~~(ptr / (256*256));
        let relPtr = ptr % (256*256);
        let x = relPtr % 256;
        let y = ~~(relPtr / 256);
        let absX = x + pageID*256;
        return [pageID, x, y, absX];
    }

    locToPtr(pageID, x, y) {
        return pageID*256*256 + y*256 + x;
    }

    addDelta(delta) {
        this.deltas.push(delta);
    }
}