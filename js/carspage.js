import {carIntNames, carRatingNames, carFlagNames, carDeltas, carTurrets, options } from './constants.js';

export class CarsPage {
    constructor(elements, sty, renderer, tabs) {
        Object.assign(this, {elements, sty, renderer, tabs});
        this.showCarHitbox = false;
        this.showCarTurret = true;
        this.selectedRemap = null;
        this.selectedCar = null;
        this.onSpriteView = () => {};
        this.render();
    }

    renderSelCanvas() {
        this.renderer.renderCarSel(
            this.elements.selcarcanv, 
            this.selectedCar,
            this.selectedRemap,
            this.showCarTurret,
            this.showCarHitbox
        );
    }

    renderCarInfo() {
        const car = this.selectedCar;
        let turretInfo = carTurrets[car.model];
        let turretText = turretInfo ? `<span class="link" id="selcartursprite">code_obj/${turretInfo.objID}</span>` : ' - ';
        
        this.renderSelCanvas();

        let infoHTML = `
            <b><abbr title="based on the order in the file">Entry ID</abbr>:</b> ${car.id}<br>
            <b>Model:</b> ${car.model}<br>
            <b>Codename:</b> ${carIntNames[car.model]}<br>
            <b>Passengers:</b> ${car.passengersCount} + driver<br>
            <b><abbr title="does the car appear on roads in singleplayer">Recycled</abbr>:</b> ${car.recycled ? 'yes' : 'no'}<br>
            <b><abbr title="rating of the car used to decide how often it appears on roads">Rating</abbr>:</b> ${carRatingNames[car.rating]}<br>
            <b>Sprite ID:</b> <span class="link" id="selcarsprite">car/${car.sprite.relID}</span><br>
            <b>Turret sprite ID:</b> ${turretText}<br>
            <b>Wreck type:</b> ${car.wreckType}<br>
            <br>
            <b>Phys. width:</b> ${car.width} px<br>
            <b>Phys. height:</b> ${car.height} px<br>
            <b>Front window offset:</b> ${car.frontWindowOffset} px<br>
            <b>Rear window offset:</b> ${car.rearWindowOffset} px<br>
            <b>Front wheels offset:</b> ${car.frontWheelOffset} px<br>
            <b>Rear wheels offset:</b> ${car.rearWheelOffset} px<br><br>
            <input type="checkbox" id="selcarhitbox" ${this.showCarHitbox?'checked':''}>
                <label for="selcarhitbox">Show hitbox</label><br>
            <input type="checkbox" id="selcarturret" ${this.showCarTurret?'checked':''}>
                <label for="selcarturret">Show turret</label>
            `;
        
        this.elements.selcarinfo.innerHTML = infoHTML;

        document.getElementById('selcarsprite').onclick = this.onSpriteView.bind(this, 'car', car.sprite.relID);
        if(turretInfo)
            document.getElementById('selcartursprite').onclick = this.onSpriteView.bind(this, 'code_obj', turretInfo.objID);
        document.getElementById('selcarhitbox').onchange = e => {
            this.showCarHitbox = !this.showCarHitbox;
            this.renderSelCanvas();
        }
        document.getElementById('selcarturret').onchange = e => {
            this.showCarTurret = !this.showCarTurret;
            this.renderSelCanvas();
        }
    }

    renderCarFlagsInfo() {
        let flagsInfoHTML = `<b>Flags:</b><br>`;
        carFlagNames.forEach((flagName, i) => {
            let isActive = this.selectedCar.flags[i];
            flagsInfoHTML += `<input type="checkbox" onclick="return false;" ${isActive ? 'checked' : ''}>
                <abbr title="${flagName[1]}">${flagName[0]}</abbr><br>`;
        });

        this.elements.selcarflagsinfo.innerHTML = flagsInfoHTML;
    }

    renderCarRemapsInfo() {
        let remapsHTML = `<b>Remaps:</b><br><div class="wrapedlist">`;
        let remaps = this.selectedCar.remaps;
        remaps.forEach(remap => {
            let color = remap.physicalPalette.getRGBAColor(80).join(', ');
            remapsHTML += `<div class="remap" id="remap_${remap.relID}"><div class="remapsq" style="background-color: rgb(${color});"></div>${remap.relID}</div>`;
        });
        remapsHTML += '<div class="remap" id="remap_clear"><div class="remapsq remapcl"></div>clear</div></div>';
        this.elements.selcarremaps.innerHTML = remapsHTML;

        let remapBtns = Array.from(document.getElementsByClassName('remap'));
        remapBtns.forEach(btn => {
            btn.onclick = (e) => {
                let remapID = btn.id.split('_')[1];
                if(remapID == 'clear') {
                    this.selectedRemap = null;
                } else {
                    let vpal = this.sty.data.virtualPalettes['car_remap'][parseInt(remapID)];
                    this.selectedRemap = vpal.physicalPalette;
                }
                this.renderSelCanvas();
                this.renderCarDeltasInfo();
            };
        });
    }
    
    renderCarDeltasInfo() {  
        let deltasCanv = this.elements.cardeltascanv;
        let changesOnly = this.elements.cardeltasmode_d.checked;
    
        this.renderer.renderCarDeltasList(deltasCanv, this.selectedCar, this.selectedRemap, changesOnly);

        let carSpriteWidth = this.selectedCar.sprite.bitmap.width;
        deltasCanv.onmousemove = (e) => {
            let deltaID = this.renderer.getPointedFromX(deltasCanv, e, carSpriteWidth + options.deltasListMargin);
            this.elements.cardeltasmove.innerHTML = `<b>Delta ID:</b> ${deltaID} / <b>Typical use:</b> ${carDeltas[deltaID] || 'unknown'}`;
        }
    }

    select(car) {
        this.elements.cardeltasmove.innerHTML = '';
        this.selectedCar = car;
        this.selectedRemap = null;
        this.renderCarInfo();
        this.renderCarFlagsInfo();
        this.renderCarRemapsInfo();
        this.renderCarDeltasInfo();
    }

    addSpritesPageReference(onSpriteView) {
        this.onSpriteView = onSpriteView;
    }

    render() {
        let carsCanv = this.elements.carscanv;
        this.renderer.renderCarsList(carsCanv);

        carsCanv.onmousemove = (e) => {
            let car = this.renderer.getPointedCar(carsCanv, e);
            this.elements.carsmove.innerHTML = `<b>Model:</b> ${car.model} / <b>Codename:</b> ${carIntNames[car.model]}`;
        }
        
        carsCanv.onclick = (e) => {
            let car = this.renderer.getPointedCar(carsCanv, e);
            this.select(car);
        }

        this.elements.cardeltasmode_o.oninput = this.renderCarDeltasInfo.bind(this);
        this.elements.cardeltasmode_d.oninput = this.renderCarDeltasInfo.bind(this);

        this.select(this.sty.data.cars[0]);
    }
}