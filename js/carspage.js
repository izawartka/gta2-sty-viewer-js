const carIntNames = [
    "ALFA", "ALLARD", "AMDB4", "APC", "BANKVAN", "BMW", "BOXCAR", "BOXTRUCK", 
    "BUG", "", "BUICK", "BUS", "COPCAR", "DART", "EDSEL", "", "FIAT", "FIRETRUK", 
    "GRAHAM", "GT24640", "", "GTRUCK", "GUNJEEP", "HOTDOG", "HOTDOG_D1", 
    "HOTDOG_D2", "HOTDOG_D3", "ICECREAM", "ISETLIMO", "ISETTA", "JEEP", "JEFFREY", 
    "LIMO", "LIMO2", "MEDICAR", "MERC", "MESSER", "MIURA", "MONSTER", "MORGAN", 
    "MORRIS", "PICKUP", "RTYPE", "", "SPIDER", "SPRITE", "STINGRAY", "STRATOS",
    "STRATOSB", "STRIPETB", "STYPE", "STYPECAB", "SWATVAN", "T2000GT", "TANK",
    "TANKER", "TAXI", "TBIRD", "TOWTRUCK", "TRAIN", "TRAINCAB", "TRAINFB", "TRANCEAM",
    "TRUKCAB1", "TRUKCAB2", "TRUKCONT", "TRUKTRNS", "TVVAN", "VAN", "VESPA", "VTYPE",
    "WBTWIN", "WRECK0", "WRECK1", "WRECK2", "WRECK3", "WRECK4", "WRECK5", "WRECK6",
    "WRECK7", "WRECK8", "WRECK9", "XK120", "ZCX5", "EDSELFBI", "HOTDOG_D4", "KRSNABUS",
];

const ratingNames = {
    1: 'bad',
    2: 'bad x2',
    3: 'bad x3',
    11: 'average',
    12: 'average x2',
    13: 'average x3',
    21: 'good',
    22: 'good x2',
    23: 'good x3',
    99: 'doesn\'t appear'
}

const flagNames = [
    ['ped_jump', 'too high for a ped to jump'],
    ['emerg_lights', 'has emergency lights (e.g. police car)'],
    ['roof_lights', 'has roof lights (come on with headlights)'],
    ['cab', 'can be used as an artic cab'],
    ['trailer', 'can be used as an artic trailer'],
    ['forhire_lights', 'has forhire lights (e.g. taxi)'],
    ['roof_decal', 'has a roof decal (e.g. TV van)'],
    ['rear_emerg_lights', 'has rear emergency lights'],
    
    ['collide_over', 'can drive over other cars'],
    ['popup', 'has popup headlights'],
];

export class CarsPage {
    constructor(elements, sty, renderer, tabs) {
        Object.assign(this, {elements, sty, renderer, tabs});
        this.showCarHitbox = false;
        this.render();
    }

    renderSelCanvas(carID, spriteID) {
        this.renderer.renderSprite(this.elements.selcarcanv, spriteID);
        if(this.showCarHitbox) this.renderer.renderCarHitbox(this.elements.selcarcanv, carID);
    }

    select(carID) {
        let carInfo = this.sty.getCarInfo(carID);
        let spriteID = this.sty.getCarSpriteID(carID);

        this.renderSelCanvas(carID, spriteID);

        let infoHTML = `
            <b><abbr title="based on the order in the file">Entry ID</abbr>:</b> ${carID}<br>
            <b>Model:</b> ${carInfo.model}<br>
            <b>Codename:</b> ${carIntNames[carInfo.model]}<br>
            <b>Capacity:</b> ${carInfo.passengers} + driver<br>
            <b><abbr title="How often the car appears on roads as a dummy">Rating</abbr>:</b> ${ratingNames[carInfo.rating]}<br>
            <b>Sprite ID:</b> ${spriteID} <span class="link" id="selcarsprite">Show details</span><br>
            <b>Wreck type:</b> ${carInfo.wreck}<br>
            <br>
            <b>Phys. width:</b> ${carInfo.width} px<br>
            <b>Phys. height:</b> ${carInfo.height} px<br>
            <b>Front window offset:</b> ${carInfo.front_window_offset} px<br>
            <b>Rear window offset:</b> ${carInfo.rear_window_offset} px<br>
            <b>Front wheels offset:</b> ${carInfo.front_wheel_offset} px<br>
            <b>Rear wheels offset:</b> ${carInfo.rear_wheel_offset} px<br>
            <input type="checkbox" id="selcarhitbox" ${this.showCarHitbox?'checked':''}>
                <label for="selcarhitbox">Show hitboxes</label>
            `;

        let flagsInfoHTML = `<b>Flags:</b><br>`;
        let carFlags = [...carInfo.info_flags, ...carInfo.info_flags_2];
        flagNames.forEach((flagName, i) => {
            let active = carFlags[i];
            flagsInfoHTML += `<input type="checkbox" onclick="return false;" ${active ? 'checked' : ''}>
                <abbr title="${flagName[1]}">${flagName[0]}</abbr><br>`;
        })
            
        this.elements.selcarflagsinfo.innerHTML = flagsInfoHTML;
        this.elements.selcarinfo.innerHTML = infoHTML;

        let selcarsprite = document.getElementById('selcarsprite');
        selcarsprite.addEventListener('click', e=>{
            this.onSpriteView(spriteID);
        });

        let selcarhitbox = document.getElementById('selcarhitbox');
        selcarhitbox.addEventListener('change', e=>{
            this.showCarHitbox = !this.showCarHitbox;   
            this.renderSelCanvas(carID, spriteID);
        })
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