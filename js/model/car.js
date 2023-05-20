export class OMCar {
    constructor(id, carInfo, sprite) {
        this.id = id;
        this.sprite = sprite;

        this.model = carInfo['model'];
        this.width = carInfo['w'];
        this.height = carInfo['h'];
        this.passengersCount = carInfo['passengers'];
        this.wreckType = carInfo['wreck'];
        this.recycled = false;
        this.rating = carInfo['rating'];
        this.frontWheelOffset = carInfo['front_wheel_offset'];
        this.rearWheelOffset = carInfo['rear_wheel_offset'];
        this.frontWindowOffset = carInfo['front_window_offset'];
        this.rearWindowOffset = carInfo['rear_window_offset'];
        this.flags = [...carInfo['info_flags'], ...carInfo['info_flags_2']];

        this.remaps = [];
        this.doors = [];
    }

    addRemap(virtualPalette) {
        this.remaps.push(virtualPalette);
    }

    addDoor(x, y) {
        this.doors.push({x, y});
    }
}