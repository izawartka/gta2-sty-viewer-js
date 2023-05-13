import { STY } from './sty.js';
import { Renderer } from './renderer.js';
import { Tabs } from './tabs.js';
import { TilesPage } from './tilespage.js';
import { SpritesPage } from './spritespage.js';
import { PPalPage } from './ppalpage.js';
import { CarsPage } from './carspage.js';
import { elementsNames } from './constants.js';

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

        const tabNames = [
            'file',
            'tiles',
            'sprites',
            'vehicles',
            'palettes',
        ]
        this.tabs = new Tabs(tabNames);

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
        this.log('Uploading...');
        this.getFileData()
            .then((data)=>{
                this.log('Reading...');
                this.sty = new STY(data);
                if(!this.sty.isFileCorrect()) {
                    this.log('Error while reading: Incorrect file');
                    return;
                }
                this.log('Rendering...');
                this.render()
                    .then(()=>{
                        this.log('Done!');
                        console.log(this);
                    });
            }, (error)=>{
                this.log('Error while uploading: ' + error);
            });
    }

    getFileData() {
        return new Promise((resolve, reject) => {
            if(elements.filesrc_ex.checked) {
                fetch('./bill.sty')
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

    render() {
        return new Promise((resolve, reject) => {
            this.renderer = new Renderer(this.sty);

            this.tilesPage = new TilesPage(this.elements, this.sty, this.renderer);
            this.spritesPage = new SpritesPage(this.elements, this.sty, this.renderer);
            this.carsPage = new CarsPage(this.elements, this.sty, this.renderer, this.tabs);
            this.carsPage.addSpritesPageReference((id) => {
                this.tabs.showTab('sprites');
                this.spritesPage.goTo(id);
            });
            this.ppalPage = new PPalPage(this.elements, this.sty, this.renderer);
            resolve();    
        });
    }
}

const main = new Main(elements);