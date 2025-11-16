"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestCameraData = getLatestCameraData;
const datagen_1 = require("../../ec-2025-main/api/datagen");
/**
 * Retrieves the latest simulated camera data.
 * @returns An array of Camera objects.
 */
function getLatestCameraData() {
    const time = new Date();
    // The datagen.ts expects time in seconds, so divide by 1000
    const jsonData = (0, datagen_1.asJSON)(time.valueOf() / 1000);
    return JSON.parse(jsonData);
}
