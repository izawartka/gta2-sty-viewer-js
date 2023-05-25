import { STY } from './sty.js';
import { Renderer } from './renderer.js';
import { Tabs } from './tabs.js';
import { elementsNames } from './constants.js';
import { TilesPage } from './pages/tilespage.js';
import { SpritesPage } from './pages/spritespage.js';
import { PalPage } from './pages/palpage.js';
import { CarsPage } from './pages/carspage.js';
import { FontsPage } from './pages/fontspage.js';
import { Prompt } from './prompt.js';
import { BMP } from './bmp.js';

let elements = {};

elementsNames.forEach(name => {
    let element = document.getElementById(name);
    if(!element) console.warn(`Element not found: ${name}`);
    elements[name] = element;
})

class Main {
    constructor(elements) {
        this.elements = elements;
        this.sty;
        this.renderer;
        this.busy = false;

        this.tabs = new Tabs();
        this.tabs.lockAllTabs(true);
        this.tabs.lockTab('file', false);

        elements.file.addEventListener('click', (event) => {
            elements.filesrc_up.checked = true;
        });

        elements.filesrc_ex.addEventListener('click', (event) => {
            elements.file.value = '';
        });

        elements.fileapply.addEventListener('click', (event) => {
            this.onFileApply();
        });
    }

    log(msg) {
        this.elements.filestatus.innerHTML = msg;
        console.log(msg);
    }

    onFileApply() {
        if(this.busy) return;
        this.busy = true;
        this.log('Uploading...');
        this.getFileData()
            .then((data)=>{
                this.log('Reading...');
                this.sty = new STY(data);
                if(!this.sty.isFileCorrect()) {
                    this.log('Error while reading: Incorrect file');
                    Prompt.notice('Error while reading: Incorrect file');
                    this.busy = false;
                    return;
                }
                this.log('Rendering...');
                this.createUI();
                this.render()
                    .then(()=>{
                        this.log('Done!');
                        this.busy = false;
                        this.tabs.lockAllTabs(false);
                        console.log(this);
                    });
            }, (error)=>{
                this.log('Error while uploading: ' + error);
                Prompt.notice('Error while uploading: ' + error);
                this.busy = false;
            });
    }

    getFileData() {
        return new Promise((resolve, reject) => {
            if(elements.filesrc_ex.checked) {
                fetch('./bil.sty')
                    .then(response => response.arrayBuffer())
                    .then(buffer => {
                        resolve(buffer);
                    });
            } else {
                let file = elements.file.files[0];
                if(!file) reject('No file selected');
                let reader = new FileReader();

                reader.onload = () => { resolve(reader.result) };
                reader.onerror = () => { reject(reader.error) };
                reader.readAsArrayBuffer(file);
            }
        });
    }

    createUI() {
        this.renderer = new Renderer(this.sty);
        this.tilesPage = new TilesPage(this.elements, this.sty, this.renderer);
        this.spritesPage = new SpritesPage(this.elements, this.sty, this.renderer);
        this.carsPage = new CarsPage(this.elements, this.sty, this.renderer, this.tabs);
        this.carsPage.addSpritesPageReference((baseName, spriteID) => {
            this.tabs.showTab('sprites');
            this.spritesPage.goToSprite(baseName, spriteID);
        });
        this.ppalPage = new PalPage(this.elements, this.sty, this.renderer);
        this.fontsPage = new FontsPage(this.elements, this.sty, this.renderer);
        BMP.addRefrences(this.render.bind(this), this.sty.getPaletteUsage.bind(this.sty));
    }

    render() {
        return new Promise((resolve, reject) => {
            this.tilesPage.render();
            this.spritesPage.render();
            this.carsPage.render();
            this.ppalPage.render();
            this.fontsPage.render();
            resolve();
        });
    }
}

const main = new Main(elements);