export class FontsPage {
    constructor(elements, sty, renderer) {
        Object.assign(this, {elements, sty, renderer});
        this.render();
    }

    render() {
        let fontsList = this.elements.fontslist;
        let fontBases = this.sty.getAllFontBases();
        let fontSizes = this.sty.getAllFontSizes();

        let fontsListHTML = '';
        fontBases.forEach((base, id)=> {
            fontsListHTML += `
                <div class="horizontal fontinlist">
                    <div class="fontdescr">
                        <b>Font ID:</b> ${id}<br>
                        <b>Font base</abbr>:</b> ${base}<br>
                        <b>Font size</abbr>:</b> ${fontSizes[id]}<br>
                    </div>
                    <canvas class="fontcanv" id="fontcanv_${id}"></canvas>
                </div>`;
        });

        fontsList.innerHTML = fontsListHTML;

        fontBases.forEach((base, id)=> {
            let fontCanv = document.getElementById(`fontcanv_${id}`);
            this.renderer.renderFontCharList(fontCanv, base, fontSizes[id]);
        });
    }
}