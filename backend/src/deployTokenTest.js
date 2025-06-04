"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const utils_1 = require("./utils");
(async () => {
    const name = "Crypto is still here";
    const symbol = "HERE";
    const xUrl = "https://x.com/cz_binance/status/1928211000190259581";
    const xUser = "cz_binance";
    try {
        const result = await (0, utils_1.deployToken)(name, symbol, xUrl, xUser);
        console.log("Deployed token:", result);
    }
    catch (e) {
        console.error(e);
    }
})();
