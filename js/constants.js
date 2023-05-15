export const elementsNames = [
    'filesrc_ex',
    'filesrc_up',
    'file',
    'fileapply',
    'filestatus',

    'tilescanv',
    'tilesmove',
    'seltilecanv',
    'seltileinfo',

    'spritescanv',
    'selspritecanv',
    'selspriteinfo',
    'spritesmove',
    'gotosprite',
    'spritesscroll',
    'spritebases',

    'carscanv',
    'carsmove',
    'selcarcanv',
    'selcarinfo',
    'selcarremaps',
    'selcarflagsinfo',
    'cardeltascanv',
    'cardeltasmode_o',
    'cardeltasmode_d',

    'ppalscanv',
    'ppalsmove',
    'selppalcanv',
    'selppalmove',
    'selppalinfo',
    'palbases',

    'fontslist',
    'fontsmove',
];

export const carIntNames = [
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

export const carRatingNames = {
    1: 'bad', // bad
    2: 'bad x2',
    3: 'bad x3',
    11: 'average', // average
    12: 'average x2',
    13: 'average x3',
    21: 'good', // good
    22: 'good x2',
    23: 'good x3',
    99: 'doesn\'t appear'
}

export const carFlagNames = [
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

export const carTurrets = { // by model
    17: { xOff: 0, yOff: 8, objID: 278, flip: true }, // firetruk
    22: { xOff: 0, yOff: -17, objID: 285, flip: false}, // gunjeep
    54: { xOff: 0, yOff: 8, objID: 546, flip: false }, // tank
};