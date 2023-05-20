import { spriteBases } from "./constants.js";
import { Helper } from "./helper.js";

export class SpritesPage {
    constructor(elements, sty, renderer) {
        Object.assign(this, {elements, sty, renderer});
        this.render();
    }

    select(sprite) {
        if(!sprite) return;
        this.elements.gotosprite.value = sprite.relID;
        this.elements.gotospritebase.value = sprite.base;
        this.renderer.renderBitmap(this.elements.selspritecanv, sprite.bitmap);

        let virtPal = sprite.bitmap.virtualPalette;

        let infoHTML = `
            <b>Sprite ID:</b> ${sprite.base}/${sprite.relID}<br>
            <b>Page ID:</b> ${sprite.pageID}<br>
            <b>X on page:</b> ${sprite.x}<br>
            <b>X:</b> ${sprite.absX}<br>
            <b>Y:</b> ${sprite.y}<br>
            <b>Width:</b> ${sprite.bitmap.width} px<br>
            <b>Height:</b> ${sprite.bitmap.height} px<br>
            <b>Virtual palette:</b> sprite/${virtPal.relID}<br>
            <b>Physical palette:</b> <input type="number" id="selspriteremap" value="${virtPal.physicalPalette.id}"><br>`;

        this.elements.selspriteinfo.innerHTML = infoHTML;

        let remapInput = document.getElementById('selspriteremap');
        remapInput.oninput = (e) => {   
            let paletteID = Helper.loopValue(0, this.sty.data.palettes.length - 1, e.target.value);
            let palette = this.sty.data.palettes[paletteID];
            this.renderer.renderBitmap(this.elements.selspritecanv, sprite.bitmap, palette);
        }
    }

    onGoToSprite() {
        let baseName = this.elements.gotospritebase.value;
        let spriteBase = this.sty.data.sprites[baseName];
        let spriteID = Helper.loopValue(0, spriteBase.length - 1, this.elements.gotosprite.value);
        this.goToSprite(baseName, spriteID);
    }

    goToSprite(baseName, spriteID) {
        let spriteBase = this.sty.data.sprites[baseName];
        if(!spriteBase) return;
        let sprite = spriteBase[spriteID];
        if(!sprite) return;

        this.select(sprite);
        this.elements.spritesscroll.scroll(sprite.absX, 0);
    }

    renderBasesList() {
        let basesHTML = '';
        let optionsHTML = '';
        for(let i = 0; i < spriteBases.length; i++) {
            let baseName = spriteBases[i];
            let base = this.sty.data.sprites[baseName];

            basesHTML += `<div class="bordered"><b>${baseName}</b>: ${base.length}</div>`;
            optionsHTML += `<option>${baseName}</option>`;
        }
        this.elements.spritebases.innerHTML = basesHTML;
        this.elements.gotospritebase.innerHTML = optionsHTML;
    }

    render() {
        let spritesCanv = this.elements.spritescanv;
        this.renderBasesList();
        this.renderer.renderSpritesList(spritesCanv);

        spritesCanv.onmousemove = (e) => {
            let sprite = this.renderer.getPointedSprite(spritesCanv, e);
            if(!sprite) {
                this.elements.spritesmove.innerHTML = '&nbsp;';
                return;
            }
            this.elements.spritesmove.innerHTML = `<b>ID:</b> ${sprite.base}/${sprite.relID} / <b>Page:</b> ${sprite.pageID}`;
        }
        spritesCanv.onclick = (e) => {
            let sprite = this.renderer.getPointedSprite(spritesCanv, e);
            this.select(sprite);
        }
        this.select(Object.values(this.sty.data.sprites)[0][0]);

        this.elements.gotosprite.oninput = this.onGoToSprite.bind(this);
        this.elements.gotospritebase.onchange = this.onGoToSprite.bind(this);
    }
}