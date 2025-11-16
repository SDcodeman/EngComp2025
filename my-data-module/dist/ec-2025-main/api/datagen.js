"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asJSON = asJSON;
exports.asCSV = asCSV;
const objects_to_csv_1 = __importDefault(require("objects-to-csv"));
class AnimatedPos {
    constructor(path) {
        this.m_positionData = path;
        this.m_lengths = new Array();
        const PATH_COUNT = this.m_positionData.length;
        for (let i = 0; i < PATH_COUNT; i++) {
            this.m_lengths.push(Math.sqrt((this.m_positionData[(i + 1) % PATH_COUNT][0] -
                this.m_positionData[i][0]) **
                2 +
                (this.m_positionData[(i + 1) % PATH_COUNT][1] -
                    this.m_positionData[i][1]) **
                    2));
        }
        this.m_time = 0;
    }
    set time(t) {
        this.m_time =
            (t / 60) % this.m_lengths.reduce((acc, curr) => acc + curr, 0);
    }
    get position() {
        const PATH_COUNT = this.m_positionData.length;
        // Compute Index
        let index = 0;
        let time = this.m_time;
        while (time >= this.m_lengths[index]) {
            time -= this.m_lengths[index];
            index++;
        }
        const slopeX = (this.m_positionData[(index + 1) % PATH_COUNT][0] -
            this.m_positionData[index][0]) /
            this.m_lengths[index];
        const slopeY = (this.m_positionData[(index + 1) % PATH_COUNT][1] -
            this.m_positionData[index][1]) /
            this.m_lengths[index];
        return [
            this.m_positionData[index][0] + time * slopeX,
            this.m_positionData[index][1] + time * slopeY,
        ];
    }
}
function ComputeWater(pos, t) {
    // Yes... This is unfortunately a hardcoded mess...
    // You might want to refer to Map.png to see how all this is connected
    // Water flows to the bottom right of the map starting from (0, 0)
    if (pos[0] == 0 && pos[1] == 0)
        return t % 100 < 60 ? 1 : 0;
    if (pos[0] == 1 && pos[1] == 0)
        return ComputeWater([0, 0], t - 60) / 2;
    if (pos[0] == 0 && pos[1] == 1)
        return (t % 100 > 60 ? 1 : 0) + ComputeWater([0, 0], t - 60);
    if (pos[0] == 1 && pos[1] == 1)
        return ComputeWater([1, 0], t - 60) + ComputeWater([0, 1], t - 60) / 2;
    if (pos[0] == 5 / 4 && pos[1] == 1)
        return ComputeWater([1, 1], t - 15) / 2;
    if (pos[0] == 3 && pos[1] == 1)
        return ComputeWater([5 / 4, 1], t - 45);
    if (pos[0] == 5 / 4 && pos[1] == 3 / 2)
        return ComputeWater([5 / 4, 1], t - 30);
    if (pos[0] == 1 && pos[1] == 2)
        return ComputeWater([1, 1], t - 60);
    if (pos[0] == 2 && pos[1] == 2)
        return ((ComputeWater([1, 2], t - 60) +
            ComputeWater([5 / 4, 3 / 2], t - 15 * Math.sqrt(61))) /
            2);
    if (pos[0] == 3 && pos[1] == 2)
        return ComputeWater([3, 1], t - 60) + ComputeWater([2, 2], t - 60);
    // Fallback: Interpolate between values
    let distance = Math.sqrt((pos[0] - Math.floor(pos[0])) ** 2 + (pos[1] - Math.floor(pos[1])));
    return ComputeWater([Math.floor(pos[0]), Math.floor(pos[1])], t - distance);
}
const Manholes = [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 2],
    [3, 2],
];
function ComputeLight(pos) {
    let Light = 0;
    for (let p of Manholes) {
        Light += Math.exp(-((pos[0] - p[0]) ** 2 + (pos[1] - p[1]) ** 2) * 3.0);
    }
    return Light;
}
/**
 * Generates simulated and modeled camera data and returns the output
 *
 * @param time
 * @returns Simulated sewer camera data that moves over time
 */
function generateData(time) {
    const CameraList = new Array();
    let Pos0 = new AnimatedPos([
        [0.0, 0.0],
        [0.0, 1.0],
        [1.0, 1.0],
        [1.0, 0.0],
    ]);
    let Pos1 = new AnimatedPos([
        [1.0, 1.0],
        [1.0, 2.0],
        [2.0, 2.0],
        [1.25, 1.5],
        [1.25, 1.0],
    ]);
    let Pos2 = new AnimatedPos([
        [3.0, 2.0],
        [3.0, 1.0],
        [1.25, 1.0],
        [1.25, 1.5],
        [2.0, 2.0],
    ]);
    Pos0.time = time;
    Pos1.time = time;
    Pos2.time = time;
    CameraList.push({
        Position: Pos0.position,
        SegmentID: 0,
        Water: ComputeWater(Pos0.position, time) / 2,
        Light: ComputeLight(Pos0.position),
        Status: "OK",
    });
    CameraList.push({
        Position: Pos1.position,
        SegmentID: 1,
        Water: ComputeWater(Pos1.position, time) / 2,
        Light: ComputeLight(Pos1.position),
        Status: "LOWLIGHT",
    });
    CameraList.push({
        Position: Pos2.position,
        SegmentID: 2,
        Water: ComputeWater(Pos2.position, time) / 2,
        Light: ComputeLight(Pos2.position),
        Status: "OK",
    });
    return CameraList;
}
function asJSON(time) {
    let Data = generateData(time);
    return JSON.stringify(Data);
}
function asCSV(time) {
    return __awaiter(this, void 0, void 0, function* () {
        let csv = new objects_to_csv_1.default(generateData(time));
        let Data = yield csv.toString();
        return Data;
    });
}
