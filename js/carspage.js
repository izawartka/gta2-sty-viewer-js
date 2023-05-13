import {carIntNames, carRatingNames, carFlagNames, carTurrets } from './constants.js';

export class CarsPage {
    constructor(elements, sty, renderer, tabs) {
        Object.assign(this, {elements, sty, renderer, tabs});
        this.showCarHitbox = false;
        this.showCarTurret = true;
        this.render();
    }

    renderSelCanvas(carID) {
        this.renderer.renderCarSel(
            this.elements.selcarcanv, 
            carID,
            -1,
            this.showCarTurret,
            this.showCarHitbox
        );
    }

    select(carID) {
        let carInfo = this.sty.getCarInfo(carID);
        let spriteID = this.sty.getCarSpriteID(carID);
        let turretInfo = carTurrets[carInfo.model];
        let turretText = ' - ';
        if(turretInfo)
            turretText = this.sty.getSpriteBase('code_obj') + turretInfo.objID + ' <span class="link" id="selcartursprite">info</span>';
        
        this.renderSelCanvas(carID);

        let infoHTML = `
            <b><abbr title="based on the order in the file">Entry ID</abbr>:</b> ${carID}<br>
            <b>Model:</b> ${carInfo.model}<br>
            <b>Codename:</b> ${carIntNames[carInfo.model]}<br>
            <b>Capacity:</b> ${carInfo.passengers} + driver<br>
            <b><abbr title="does the car appear on roads in singleplayer">Recycled</abbr>:</b> ${this.sty.getCarRecycled(carID) ? 'yes' : 'no'}<br>
            <b><abbr title="rating of the car used to decide how often it appears on roads">Rating</abbr>:</b> ${carRatingNames[carInfo.rating]}<br>
            <b>Sprite ID:</b> ${spriteID} <span class="link" id="selcarsprite">info</span><br>
            <b>Wreck type:</b> ${carInfo.wreck}<br>
            <b>Turret object ID:</b> ${turretText}<br>
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
                <label for="selcarhitbox">Show turret</label>
            `;

        let flagsInfoHTML = `<b>Flags:</b><br>`;
        let carFlags = [...carInfo.info_flags, ...carInfo.info_flags_2];
        carFlagNames.forEach((flagName, i) => {
            let active = carFlags[i];
            flagsInfoHTML += `<input type="checkbox" onclick="return false;" ${active ? 'checked' : ''}>
                <abbr title="${flagName[1]}">${flagName[0]}</abbr><br>`;
        })
            
        this.elements.selcarflagsinfo.innerHTML = flagsInfoHTML;
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

    addSpritesPageReference(onSpriteView) {
        this.onSpriteView = onSpriteView;
    }

    render() {
        let carsCanv = this.elements.carscanv;
        this.renderer.renderCarsList(carsCanv);
        carsCanv.addEventListener('mousemove', e=> {
            let carID = this.renderer.getPointedCarID(carsCanv, e);
            let carModel = this.sty.getCarInfo(carID).model;
            this.elements.carsmove.innerHTML = `Model: ${carModel} Codename: ${carIntNames[carModel]}`;
        })
        carsCanv.addEventListener('click', e=> {
            let carID = this.renderer.getPointedCarID(carsCanv, e);
            this.select(carID);
        });
        this.select(0);
    }
}