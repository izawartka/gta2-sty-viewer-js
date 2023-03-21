export class TilesPage {
    constructor(elements, sty, renderer) {
        Object.assign(this, {elements, sty, renderer});
        this.render();
    }

    select(tileID) {
        let pageID = ~~(tileID/16);
        let tileIDinPage = tileID%16;
        this.renderer.renderTile(this.elements.seltilecanv, pageID, tileIDinPage);

        let infoHTML = `
            <b>Tile ID:</b> ${tileID}<br>
            <b>Page ID:</b> ${pageID}<br>
            <b>Tile on page ID:</b> ${tileIDinPage}<br>
            <b>Virtual palette:</b> ${this.sty.getVPaletteID('tile', tileID)}<br>
            <b>Physical palette:</b> ${this.sty.getPPaletteID('tile', tileID)}<br>
            <b>Material:</b> ${this.sty.getMaterialName(tileID)}<br>`;

        this.elements.seltileinfo.innerHTML = infoHTML;
    }

    render() {
        let tilesCanv = this.elements.tilescanv;
        this.renderer.renderTilesList(tilesCanv);
        tilesCanv.addEventListener('mousemove', e=> {
            let tileID = this.renderer.getPointedTileID(tilesCanv, e);
            this.elements.tilesmmove.innerHTML = `ID: ${tileID} Page: ${~~(tileID/16)}`;
        })
        tilesCanv.addEventListener('click', e=> {
            let tileID = this.renderer.getPointedTileID(tilesCanv, e);
            this.select(tileID);
        });
        this.select(0);
    }
}