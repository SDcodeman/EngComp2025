"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_provider_1 = require("./data-provider");
function runTest() {
    const cameraData = (0, data_provider_1.getLatestCameraData)();
    console.log("Total cameras:", cameraData.length);
    if (cameraData.length > 0) {
        console.log("First camera data:", cameraData[0]);
    }
    else {
        console.log("No camera data received.");
    }
}
runTest();
