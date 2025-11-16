"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const data_provider_1 = require("./data-provider");
const app = (0, express_1.default)();
const port = 3000;
app.get('/api/data', (req, res) => {
    const data = (0, data_provider_1.getLatestCameraData)();
    res.json(data);
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
