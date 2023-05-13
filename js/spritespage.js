export class SpritesPage {
    constructor(elements, sty, renderer) {
        Object.assign(this, {elements, sty, renderer});
        this.render();
    }

    select(spriteID) {
        this.elements.gotosprite.value = spriteID;
        let spriteIndex = this.sty.getSpriteIndex(spriteID);
        let spritePos = this.sty.getSpritePixelPos(spriteIndex.ptr);
        this.renderer.renderSprite(this.elements.selspritecanv, spriteID);
        let spriteRelID = spriteID - this.sty.getSpriteBase(this.sty.getSpriteType(spriteID));

        let infoHTML = `
            <b>Sprite ID:</b> ${spriteID}<br>
            <b>Page ID:</b> ${spritePos.page}<br>
            <b>X on page:</b> ${spritePos.x}<br>
            <b>X:</b> ${spritePos.absX}<br>
            <b>Y:</b> ${spritePos.y}<br>
            <b>Width:</b> ${spriteIndex.size[0]} px<br>
            <b>Height:</b> ${spriteIndex.size[1]} px<br>
            <b>Virtual palette:</b> ${this.sty.getVPaletteID('sprite', spriteID)}<br>
            <b>Physical palette:</b> <input type="number" id="selspriteremap" value="${this.sty.getPPaletteID('sprite', spriteID)}"><br>
            <b>Type / Base:</b> ${this.sty.getSpriteType(spriteID)}<br>
            <b><abbr title="id relative to object\'s base">Relative ID</abbr>:</b> ${spriteRelID}<br>`;
            

        this.elements.selspriteinfo.innerHTML = infoHTML;

        let remapInput = document.getElementById('selspriteremap');
        remapInput.addEventListener('input', e=>{   
            let ppalID = parseInt(remapInput.value);
            if(isNaN(ppalID)) return;
            if(ppalID < 0) return;
            if(ppalID >= this.sty.getPPalettePagesCount() * 64) return
            this.renderer.renderSprite(this.elements.selspritecanv, spriteID, ppalID);
        })
    }

    goTo(spriteID) {
        if(isNaN(spriteID)) return;
        if(spriteID < 0) return;
        if(spriteID >= this.sty.getSpritesCount()) return;
        this.select(spriteID);
        const spriteIndex = this.sty.getSpriteIndex(spriteID);
        let spriteX = this.sty.getSpritePixelPos(spriteIndex.ptr).absX;
        this.elements.spritesscroll.scroll(spriteX, 0);
    }

    renderBasesList() {
        let html = '';
        let bases = this.sty.getAllSpriteBases();
        Object.keys(bases).forEach(baseName=>{
            html += `<div class="bordered"><b>${baseName}</b>: ${bases[baseName]}</div>`;
        });
        this.elements.spritebases.innerHTML = html;
    }

    render() {
        let spritesCanv = this.elements.spritescanv;
        this.renderBasesList();
        this.renderer.renderSpritesList(spritesCanv);
        spritesCanv.addEventListener('mousemove', e=>{
            let spriteID = this.renderer.getPointedSpriteID(spritesCanv, e);
            if(spriteID == -1) {
                this.elements.spritesmove.innerHTML = '&nbsp;';
                return;
            }
            let spriteIndex = this.sty.getSpriteIndex(spriteID);
            let spritePos = this.sty.getSpritePixelPos(spriteIndex.ptr);
            this.elements.spritesmove.innerHTML = `ID: ${spriteID} Page: ${spritePos.page}`;
        });
        spritesCanv.addEventListener('click', e=> {
            let spriteID = this.renderer.getPointedSpriteID(spritesCanv, e);
            if(spriteID == -1) {
                this.elements.spritesmove.innerHTML = '&nbsp;';
                return;
            }
            this.select(spriteID);
        })
        this.select(0);

        this.elements.gotosprite.addEventListener('input', e=>{
            let spriteID = parseInt(this.elements.gotosprite.value);
            this.goTo(spriteID);
        });
    }
}