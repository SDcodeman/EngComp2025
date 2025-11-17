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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputeWater = ComputeWater;
exports.ComputeLight = ComputeLight;
exports.findClosestPoint = findClosestPoint;
exports.asJSON = asJSON;
exports.asCSV = asCSV;
var ObjectsToCSV = require("objects-to-csv");
var AnimatedPos = /** @class */ (function () {
    function AnimatedPos(path) {
        this.m_positionData = path;
        this.m_lengths = new Array();
        var PATH_COUNT = this.m_positionData.length;
        for (var i = 0; i < PATH_COUNT; i++) {
            this.m_lengths.push(Math.sqrt(Math.pow((this.m_positionData[(i + 1) % PATH_COUNT][0] -
                this.m_positionData[i][0]), 2) +
                Math.pow((this.m_positionData[(i + 1) % PATH_COUNT][1] -
                    this.m_positionData[i][1]), 2)));
        }
        this.m_time = 0;
    }
    Object.defineProperty(AnimatedPos.prototype, "time", {
        set: function (t) {
            this.m_time =
                (t / 60) % this.m_lengths.reduce(function (acc, curr) { return acc + curr; }, 0);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AnimatedPos.prototype, "position", {
        get: function () {
            var PATH_COUNT = this.m_positionData.length;
            // Compute Index
            var index = 0;
            var time = this.m_time;
            while (time >= this.m_lengths[index]) {
                time -= this.m_lengths[index];
                index++;
            }
            var slopeX = (this.m_positionData[(index + 1) % PATH_COUNT][0] -
                this.m_positionData[index][0]) /
                this.m_lengths[index];
            var slopeY = (this.m_positionData[(index + 1) % PATH_COUNT][1] -
                this.m_positionData[index][1]) /
                this.m_lengths[index];
            return [
                this.m_positionData[index][0] + time * slopeX,
                this.m_positionData[index][1] + time * slopeY,
            ];
        },
        enumerable: false,
        configurable: true
    });
    return AnimatedPos;
}());
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
    var distance = Math.sqrt(Math.pow((pos[0] - Math.floor(pos[0])), 2) + (pos[1] - Math.floor(pos[1])));
    return ComputeWater([Math.floor(pos[0]), Math.floor(pos[1])], t - distance);
}
var NODES = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
    [5 / 4, 1],
    [3, 1],
    [5 / 4, 3 / 2],
    [1, 2],
    [2, 2],
    [3, 2],
];
var PIPES = [
    [NODES[0], NODES[1]],
    [NODES[0], NODES[2]],
    [NODES[1], NODES[3]],
    [NODES[2], NODES[3]],
    [NODES[3], NODES[4]],
    [NODES[4], NODES[5]],
    [NODES[4], NODES[6]],
    [NODES[3], NODES[7]],
    [NODES[7], NODES[8]],
    [NODES[6], NODES[8]],
    [NODES[5], NODES[9]],
    [NODES[8], NODES[9]],
];
var Manholes = [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 2],
    [3, 2],
];
function ComputeLight(pos) {
    var Light = 0;
    for (var _i = 0, Manholes_1 = Manholes; _i < Manholes_1.length; _i++) {
        var p = Manholes_1[_i];
        Light += Math.exp(-(Math.pow((pos[0] - p[0]), 2) + Math.pow((pos[1] - p[1]), 2)) * 3.0);
    }
    // Scale to 0-255 range, assuming a max natural light value of around 2.5-3.0
    // Clamp between 0 and 255 and round to nearest integer
    var scaledLight = Math.round(Math.max(0, Math.min(255, (Light / 2.5) * 255)));
    return scaledLight;
}
/**
 * Generates simulated and modeled camera data and returns the output
 *
 * @param time
 * @returns Simulated sewer camera data that moves over time
 */
/**
 * Generates simulated and modeled camera data and returns the output
 *
 * @param time
 * @returns Simulated sewer camera data that moves over time
 */
function generateData(time) {
    var CameraList = new Array();
    // Generate data for nodes
    for (var i = 0; i < NODES.length; i++) {
        var position = NODES[i];
        var status_1 = void 0;
        if (i % 3 === 0) {
            status_1 = "OK";
        }
        else if (i % 3 === 1) {
            status_1 = "LOWLIGHT";
        }
        else {
            status_1 = "CRITICAL";
        }
        CameraList.push({
            Position: position,
            SegmentID: i, // Unique SegmentID for nodes
            Water: ComputeWater(position, time + i * 5) / 2,
            Light: ComputeLight(position),
            Status: status_1,
            isNode: true,
        });
    }
    // Generate data for points on pipes
    var segmentIdCounter = NODES.length;
    for (var i = 0; i < PIPES.length; i++) {
        var pipe = PIPES[i];
        var pointsOnPipe = generatePointsOnPipe(pipe, 3);
        for (var j = 0; j < pointsOnPipe.length; j++) {
            var position = pointsOnPipe[j];
            var status_2 = void 0;
            if (segmentIdCounter % 3 === 0) {
                status_2 = "OK";
            }
            else if (segmentIdCounter % 3 === 1) {
                status_2 = "LOWLIGHT";
            }
            else {
                status_2 = "CRITICAL";
            }
            CameraList.push({
                Position: position,
                SegmentID: segmentIdCounter++, // Unique SegmentID for points on pipes
                Water: ComputeWater(position, time + segmentIdCounter * 5) / 2,
                Light: ComputeLight(position),
                Status: status_2,
                isNode: false,
            });
        }
    }
    return CameraList;
}
function generatePointsOnPipe(pipe, numPoints) {
    var points = [];
    var start = pipe[0], end = pipe[1];
    for (var i = 1; i <= numPoints; i++) {
        var t = i / (numPoints + 1);
        var x = start[0] + t * (end[0] - start[0]);
        var y = start[1] + t * (end[1] - start[1]);
        points.push([x, y]);
    }
    return points;
}
function findClosestPoint(point) {
    var closestPoint = [-1, -1];
    var minDistance = Infinity;
    for (var _i = 0, PIPES_1 = PIPES; _i < PIPES_1.length; _i++) {
        var pipe = PIPES_1[_i];
        var start = pipe[0], end = pipe[1];
        var dx = end[0] - start[0];
        var dy = end[1] - start[1];
        if (dx === 0 && dy === 0) {
            // The pipe is a point (start and end are the same)
            var d = Math.sqrt(Math.pow((point[0] - start[0]), 2) + Math.pow((point[1] - start[1]), 2));
            if (d < minDistance) {
                minDistance = d;
                closestPoint = start;
            }
            continue;
        }
        // Calculate the projection of the point onto the line defined by the pipe
        // t is the parameter along the line segment [0, 1]
        var t = ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) /
            (dx * dx + dy * dy);
        var currentClosest = void 0;
        if (t < 0) {
            // Closest point is the start of the segment
            currentClosest = start;
        }
        else if (t > 1) {
            // Closest point is the end of the segment
            currentClosest = end;
        }
        else {
            // Closest point is on the segment
            currentClosest = [start[0] + t * dx, start[1] + t * dy];
        }
        var distance = Math.sqrt(Math.pow((point[0] - currentClosest[0]), 2) + Math.pow((point[1] - currentClosest[1]), 2));
        if (distance < minDistance) {
            minDistance = distance;
            closestPoint = currentClosest;
        }
    }
    return closestPoint;
}
function asJSON(time) {
    var Data = generateData(time);
    return JSON.stringify(Data);
}
function asCSV(time) {
    return __awaiter(this, void 0, void 0, function () {
        var csv, Data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    csv = new ObjectsToCSV(generateData(time));
                    return [4 /*yield*/, csv.toString()];
                case 1:
                    Data = _a.sent();
                    return [2 /*return*/, Data];
            }
        });
    });
}
