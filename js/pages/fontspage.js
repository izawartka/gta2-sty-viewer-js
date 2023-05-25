export class FontsPage {
    constructor(elements, sty, renderer) {
        Object.assign(this, {elements, sty, renderer});
    }

    render() {
        let fontsList = this.elements.fontslist;

        let fontsListHTML = '';
        this.sty.data.fonts.forEach((font) => {
            fontsListHTML += `
                <div class="horizontal fontinlist">
                    <div class="fontdescr">
                        <b>Font ID:</b> ${font.id}<br>
                        <b>Font base</abbr>:</b> ${font.sprites[0].relID}<br>
                        <b>Font size</abbr>:</b> ${font.sprites.length}<br>
                    </div>
                    <canvas class="fontcanv" id="fontcanv_${font.id}"></canvas>
                </div>`;
        });

        fontsList.innerHTML = fontsListHTML;

        this.sty.data.fonts.forEach((font) => {
            let fontCanv = document.getElementById(`fontcanv_${font.id}`);
            this.renderer.renderFontCharList(fontCanv, font);
        });
    }
}