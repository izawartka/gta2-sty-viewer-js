export class OMVirtualPalette {
    constructor(baseName, relID, physicalPalette) {
        this.baseName = baseName;
        this.relID = relID;
        this.physicalPalette = physicalPalette;
    }

    setPPal(physicalPalette) {
        this.physicalPalette.removeUsage(this);
        this.physicalPalette = physicalPalette;
        physicalPalette.addUsage(this);
    }
}