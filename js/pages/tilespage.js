import { materialNames } from "../constants.js";

export class TilesPage {
    constructor(elements, sty, renderer) {
        Object.assign(this, {elements, sty, renderer});
        this.render();
    }

    select(tileID) {
        let tile = this.sty.data.tiles[tileID];
        this.renderer.renderBitmap(this.elements.seltilecanv, tile.bitmap);

        let infoHTML = `
            <b>Tile ID:</b> ${tileID}<br>
            <b>Page ID:</b> ${tile.pageID}<br>
            <b>Tile on page ID:</b> ${tile.relID}<br>
            <b>Virtual palette:</b> tile/${tile.bitmap.virtualPalette.relID}<br>
            <b>Physical palette:</b> ${tile.bitmap.virtualPalette.physicalPalette.id}<br>
            <b>Material:</b> ${materialNames[tile.material] || ''}<br>`;

        this.elements.seltileinfo.innerHTML = infoHTML;
    }

    render() {
        let tilesCanv = this.elements.tilescanv;
        this.renderer.renderTilesList(tilesCanv);
        tilesCanv.onmousemove = (e) => {
            let tileID = this.renderer.getPointedTileID(tilesCanv, e);
            this.elements.tilesmove.innerHTML = `<b>ID:</b> ${tileID} / <b>Page:</b> ${~~(tileID/16)}`;
        }
        tilesCanv.onclick = (e) => {
            let tileID = this.renderer.getPointedTileID(tilesCanv, e);
            this.select(tileID);
        };
        this.select(0);
    }
}