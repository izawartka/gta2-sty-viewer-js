import { STY } from './sty.js';
import { Renderer } from './renderer.js';
import { Tabs } from './tabs.js';
import { TilesPage } from './tilespage.js';
import { SpritesPage } from './spritespage.js';
import { PPalPage } from './ppalpage.js';
import { CarsPage } from './carspage.js';

const elementsNames = [
    'file',
    'fileapply',
    'filestatus',
    'tilescanv',
    'ppalscanv',
    'spritescanv',
    'tilesmmove',
    'seltilecanv',
    'seltileinfo',
    'selspritecanv',
    'selspriteinfo',
    'spritesmove',
    'gotosprite',
    'spritesscroll',
    'carscanv',
    'carsmove',
    'selcarcanv',
    'selcarinfo',
    'selcarflagsinfo',
];

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

        elements.fileapply.addEventListener('click', (event) => {
            this.elements.filestatus.innerHTML = 'Reading...';
            this.readSTY(elements.file.files[0])
                .then(()=>{
                    this.render()
                });
        });
    }

    readSTY(file) {
        return new Promise((resolve, reject) => {
            var reader = new FileReader();

            reader.onload = () => 
            {
                this.sty = new STY(reader.result)
                resolve();
            };

            reader.readAsArrayBuffer(file);
        });
    }

    render() {
        this.elements.filestatus.innerHTML = 'Rendering...';
        this.renderer = new Renderer(this.sty);

        this.tilesPage = new TilesPage(this.elements, this.sty, this.renderer);
        this.spritesPage = new SpritesPage(this.elements, this.sty, this.renderer);
        this.carsPage = new CarsPage(this.elements, this.sty, this.renderer, this.tabs);
        this.carsPage.addSpritesPageReference((id) => {
            this.tabs.showTab('sprites');
            this.spritesPage.goTo(id);
        });
        this.ppalPage = new PPalPage(this.elements, this.sty, this.renderer);
        
        this.elements.filestatus.innerHTML = 'Done!';
        console.log(this);
    }
}

const main = new Main(elements);