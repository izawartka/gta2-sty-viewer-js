import {carIntNames, carRatingNames, carFlagNames, carTurrets } from './constants.js';

export class CarsPage {
    constructor(elements, sty, renderer, tabs) {
        Object.assign(this, {elements, sty, renderer, tabs});
        this.showCarHitbox = false;
        this.showCarTurret = true;
        this.selectedRemap = -1;
        this.selectedCarID = -1;
        this.render();
    }

    renderSelCanvas(carID) {
        this.renderer.renderCarSel(
            this.elements.selcarcanv, 
            carID,
            this.selectedRemap,
            this.showCarTurret,
            this.showCarHitbox
        );
    }

    renderCarInfo(carID, carInfo) {
        let spriteID = this.sty.getCarSpriteID(carID);
        let turretInfo = carTurrets[carInfo.model];
        let turretText = turretInfo ? `<span class="link" id="selcartursprite">code_obj/${turretInfo.objID}</span>` : ' - ';
        
        this.renderSelCanvas(carID);

        let infoHTML = `
            <b><abbr title="based on the order in the file">Entry ID</abbr>:</b> ${carID}<br>
            <b>Model:</b> ${carInfo.model}<br>
            <b>Codename:</b> ${carIntNames[carInfo.model]}<br>
            <b>Capacity:</b> ${carInfo.passengers} + driver<br>
            <b><abbr title="does the car appear on roads in singleplayer">Recycled</abbr>:</b> ${this.sty.getCarRecycled(carInfo.model) ? 'yes' : 'no'}<br>
            <b><abbr title="rating of the car used to decide how often it appears on roads">Rating</abbr>:</b> ${carRatingNames[carInfo.rating]}<br>
            <b>Sprite ID:</b> <span class="link" id="selcarsprite">car/${spriteID}</span><br>
            <b>Turret sprite ID:</b> ${turretText}<br>
            <b>Wreck type:</b> ${carInfo.wreck}<br>
            <br>
            <b>Phys. width:</b> ${carInfo.width} px<br>
            <b>Phys. height:</b> ${carInfo.height} px<br>
            <b>Front window offset:</b> ${carInfo.front_window_offset} px<br>
            <b>Rear window offset:</b> ${carInfo.rear_window_offset} px<br>
            <b>Front wheels offset:</b> ${carInfo.front_wheel_offset} px<br>
            <b>Rear wheels offset:</b> ${carInfo.rear_wheel_offset} px<br><br>
            <input type="checkbox" id="selcarhitbox" ${this.showCarHitbox?'checked':''}>
                <label for="selcarhitbox">Show hitbox</label><br>
            <input type="checkbox" id="selcarturret" ${this.showCarTurret?'checked':''}>
                <label for="selcarturret">Show turret</label>
            `;
        
        this.elements.selcarinfo.innerHTML = infoHTML;

        const localElements = {
            'selcarsprite': {
                action: 'click',
                handler: e => {
                    this.onSpriteView(spriteID);
                }
            },
            'selcartursprite': {
                action: 'click',
                handler: e => {
                    this.onSpriteView(this.sty.getSpriteBase('code_obj') + turretInfo.objID);
                }
            },
            'selcarhitbox': {
                action: 'change',
                handler: e => {
                    this.showCarHitbox = !this.showCarHitbox;   
                    this.renderSelCanvas(carID);
                }
            },
            'selcarturret': {
                action: 'change',
                handler: e => {
                    this.showCarTurret = !this.showCarTurret;   
                    this.renderSelCanvas(carID);
                }
            }
        }

        Object.keys(localElements).forEach(key => {
            let element = document.getElementById(key);
            if(!element) return;
            element.addEventListener(localElements[key].action, localElements[key].handler);
        });
    }

    renderCarFlagsInfo(carInfo) {
        let flagsInfoHTML = `<b>Flags:</b><br>`;
        let carFlags = [...carInfo.info_flags, ...carInfo.info_flags_2];
        carFlagNames.forEach((flagName, i) => {
            let active = carFlags[i];
            flagsInfoHTML += `<input type="checkbox" onclick="return false;" ${active ? 'checked' : ''}>
                <abbr title="${flagName[1]}">${flagName[0]}</abbr><br>`;
        });

        this.elements.selcarflagsinfo.innerHTML = flagsInfoHTML;
    }

    renderCarRemapsInfo(carID, carInfo) {
        let remapsHTML = `<b>Remaps:</b><br><div class="wrapedlist">`;
        carInfo.remaps.forEach(remap => {
            let ppalID = this.sty.getPPaletteID('car_remap', remap)
            let ppal = this.sty.getPPalette(ppalID);
            let color = [ppal[80*4+2], ppal[80*4+1], ppal[80*4]].join(', ');
            remapsHTML += `<div class="remap" id="remap_${remap}"><div class="remapsq" style="background-color: rgb(${color});"></div>${remap}</div>`;
        });
        remapsHTML += '<div class="remap" id="remap_clear"><div class="remapsq remapcl"></div>clear</div></div>';
        this.elements.selcarremaps.innerHTML = remapsHTML;

        let remapBtns = Array.from(document.getElementsByClassName('remap'));
        remapBtns.forEach(btn => {
            btn.addEventListener('click', e => {
                let remapID = parseInt(btn.id.split('_')[1]);
                this.selectedRemap = this.sty.getPPaletteID('car_remap', remapID);
                if(btn.id == 'remap_clear') this.selectedRemap = -1;
                this.renderSelCanvas(carID);
                this.renderCarDeltasInfo(carID);
            });
        });
    }
    
    renderCarDeltasInfo() {   
        let carID = this.selectedCarID;
        let deltasCanv = this.elements.cardeltascanv;
        let overlayMode = this.elements.cardeltasmode_o.checked;
    
        this.renderer.renderCarDeltas(deltasCanv, carID, this.selectedRemap, overlayMode);
    }

    select(carID) {
        this.selectedCarID = carID;
        this.selectedRemap = -1;
        let carInfo = this.sty.getCarInfo(carID);
        this.renderCarInfo(carID, carInfo);
        this.renderCarFlagsInfo(carInfo);
        this.renderCarRemapsInfo(carID, carInfo);
        this.renderCarDeltasInfo(carID);
    }

    addSpritesPageReference(onSpriteView) {
        this.onSpriteView = onSpriteView;
    }

    render() {
        let carsCanv = this.elements.carscanv;
        this.renderer.renderCarsList(carsCanv);

        carsCanv.addEventListener('mousemove', e=> {
            let carID = this.renderer.getPointedCarID(carsCanv, e);
            let carModel = this.sty.getCarInfo(carID).model;
            this.elements.carsmove.innerHTML = `<b>Model:</b> ${carModel} / <b>Codename:</b> ${carIntNames[carModel]}`;
        })
        
        carsCanv.addEventListener('click', e=> {
            let carID = this.renderer.getPointedCarID(carsCanv, e);
            this.select(carID);
        });

        this.elements.cardeltasmode_o.addEventListener('input', this.renderCarDeltasInfo.bind(this));
        this.elements.cardeltasmode_d.addEventListener('input', this.renderCarDeltasInfo.bind(this));

        this.select(0);
    }
}