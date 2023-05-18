import { Helper } from "./helper.js";

export class PalPage {
    constructor(elements, sty, renderer) {
        Object.assign(this, {elements, sty, renderer});
        this.scale = 4;
        this.selScale = 5;
        this.selectedPaletteID = -1;
        this.render();
    }

    select(paletteID) {
        this.selectedPaletteID = paletteID;
        this.elements.selppalmove.innerHTML = '&nbsp;';
        this.renderer.renderPaletteSel(this.elements.selppalcanv, paletteID, this.selScale);

        let infoHTML = `
            <b>Palette ID:</b> ${paletteID}<br>
            <b><abbr title="virtual palettes that use this palette">Used by</abbr>:</b><br>`;

        const usage = this.sty.getPPalUsage(paletteID);
        for (const [baseName, ids] of Object.entries(usage)) {
            infoHTML += `${baseName}/: ${Helper.arrayToRanges(ids)}<br>`;
        }
        this.elements.selppalinfo.innerHTML = infoHTML;
    }

    renderBasesList() {
        let html = '';
        let bases = this.sty.getAllPalBases();
        Object.keys(bases).forEach(baseName=>{
            html += `<div class="bordered"><b>${baseName}</b>: ${bases[baseName]}</div>`;
        });
        this.elements.palbases.innerHTML = html;
    }

    render() {
        let ppalsCanv = this.elements.ppalscanv;
        this.renderer.renderPalettesList(ppalsCanv, this.scale);

        ppalsCanv.addEventListener('mousemove', e=> {
            let ppalID = this.renderer.getPointedFromX(ppalsCanv, e, this.scale);
            this.renderer.renderPalettesList(ppalsCanv, this.scale, ppalID);
            this.elements.ppalsmove.innerHTML = `<b>ID:</b> ${ppalID} / <b>Page:</b> ${~~(ppalID/64)}`;
        })

        ppalsCanv.addEventListener('click', e=> {
            let ppalID = this.renderer.getPointedFromX(ppalsCanv, e, this.scale);
            this.select(ppalID);
        });

        let selPpalCanv = this.elements.selppalcanv;
        selPpalCanv.addEventListener('mousemove', e=> {
            if(this.selectedPaletteID == -1) return;
            let colorPos = this.renderer.getPointedFromX(selPpalCanv, e, this.selScale);
            this.showColorDetails(colorPos);
        });

        this.select(0);
        this.renderBasesList();
    }

    showColorDetails(colorPos) {
        this.renderer.renderPaletteSel(this.elements.selppalcanv, this.selectedPaletteID, this.selScale, colorPos);

        let ppal = this.sty.getPPalette(this.selectedPaletteID);
        let color = [ppal[colorPos*4+2], ppal[colorPos*4+1], ppal[colorPos*4+0], 255-ppal[colorPos*4+3]];
        this.elements.selppalmove.innerHTML = 
            `<b>Index:</b> ${colorPos} / 
            <b>Color:</b> rgba(${color.join(', ')}) / 
            <b>Hex:</b> ${Helper.colorToHex(color)}`;
    }
}