export class PPalPage {
    constructor(elements, sty, renderer) {
        Object.assign(this, {elements, sty, renderer});
        this.render();
    }

    select(paletteID) {
    }

    render() {
        let ppalCanv = this.elements.ppalscanv;
        this.renderer.renderPalettesList(ppalCanv);
    }
}