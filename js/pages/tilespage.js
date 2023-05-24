import { materialNames } from "../constants.js";
import { Helper } from "../helper.js";
import { BMP } from "../bmp.js";

export class TilesPage {
    constructor(elements, sty, renderer) {
        Object.assign(this, {elements, sty, renderer});
        this.render();
    }

    select(tileID) {
        let tile = this.sty.data.tiles[tileID];
        let virtPal = tile.bitmap.virtualPalette;
        this.renderer.renderBitmap(this.elements.seltilecanv, tile.bitmap);

        let infoHTML = `
            <b>Tile ID:</b> ${tileID}<br>
            <b>Page ID:</b> ${tile.pageID}<br>
            <b>Tile on page ID:</b> ${tile.relID}<br>
            <b>Virtual palette:</b> tile/${virtPal.relID}<br>
            <b>Physical palette:</b> <input type="number" id="seltileremap" value="${virtPal.physicalPalette.id}"><br>
            <b>Material:</b> ${materialNames[tile.material] || ''}<br><br>
            <button id="seltilesave">Download BMP</button><br>
            <button id="seltileopen">Upload BMP</button>`;

        this.elements.seltileinfo.innerHTML = infoHTML;

        let remapInput = document.getElementById('seltileremap');
        remapInput.oninput = (e) => {   
            let paletteID = Helper.loopValue(0, this.sty.data.palettes.length - 1, e.target.value);
            let palette = this.sty.data.palettes[paletteID];
            this.renderer.renderBitmap(this.elements.seltilecanv, tile.bitmap, palette);
        }

        document.getElementById('seltilesave').onclick = () => {
            BMP.save(tile.bitmap, `tile_${tileID}.bmp`);
        }

        document.getElementById('seltileopen').onclick = () => {
            BMP.open();
        }
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