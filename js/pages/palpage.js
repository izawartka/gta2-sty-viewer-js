import { Helper } from "../helper.js";
import { options, paletteBases } from "../constants.js"

export class PalPage {
    constructor(elements, sty, renderer) {
        Object.assign(this, {elements, sty, renderer});
        this.selectedPalette = this.sty.data.palettes[0];
    }

    select(palette) {
        if(!palette) return;
        this.selectedPalette = palette;

        this.elements.selppalmove.innerHTML = '&nbsp;';
        this.renderer.renderPaletteSel(this.elements.selppalcanv, palette);

        let infoHTML = `
            <b>Palette ID:</b> ${palette.id}<br>
            <b><abbr title="virtual palettes that use this palette">Used by</abbr>:</b><br>`;

        const usage = this.sty.getPaletteUsage(palette);
        for (const [baseName, ids] of Object.entries(usage)) {
            infoHTML += `${baseName}/: ${Helper.arrayToRanges(ids)}<br>`;
        }

        this.elements.selppalinfo.innerHTML = infoHTML;
        
    }

    renderBasesList() {
        let basesHTML = '';
        for(let i = 0; i < paletteBases.length; i++) {
            let baseName = paletteBases[i];
            let base = this.sty.data.virtualPalettes[baseName];
            if(!base) continue;

            basesHTML += `<div class="bordered"><b>${baseName}</b>: ${base.length}</div>`;
        }
        this.elements.palbases.innerHTML = basesHTML;
    }

    render() {
        let ppalsCanv = this.elements.ppalscanv;
        this.renderer.renderPalettesList(ppalsCanv);

        ppalsCanv.onmousemove = (e) => {
            let ppalID = this.renderer.getPointedFromX(ppalsCanv, e, options.palettesListScale);
            this.renderer.renderPalettesList(ppalsCanv, ppalID);
            this.elements.ppalsmove.innerHTML = `<b>ID:</b> ${ppalID} / <b>Page:</b> ${~~(ppalID/64)}`;
        }

        ppalsCanv.onclick = (e) => {
            let ppalID = this.renderer.getPointedFromX(ppalsCanv, e, options.palettesListScale);
            let palette = this.sty.data.palettes[ppalID];
            this.select(palette);
        }

        let selPpalCanv = this.elements.selppalcanv;
        this.elements.selppalcanv.onmousemove = (e) => {
            let colorPos = this.renderer.getPointedFromX(selPpalCanv, e, options.paletteSelScale);
            this.showColorDetails(colorPos);
        };

        this.select(this.selectedPalette);
        this.renderBasesList();
    }

    showColorDetails(colorPos) {
        if(!this.selectedPalette) return;
        this.renderer.renderPaletteSel(this.elements.selppalcanv, this.selectedPalette, colorPos);
        let color = this.selectedPalette.getColor(colorPos);
        this.elements.selppalmove.innerHTML = 
            `<b>Index:</b> ${colorPos} / 
            <b>Color:</b> rgba(${color.join(', ')}) / 
            <b>Hex:</b> ${Helper.colorToHex(color)}`;
    }
}