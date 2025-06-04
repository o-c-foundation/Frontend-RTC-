"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const utils_1 = require("./utils");
(async () => {
    const testText = "When you press F to pay respects and the whole internet joins in. #PressF";
    try {
        const result = await (0, utils_1.suggestToken)(testText);
        console.log("Suggested token:", result);
    }
    catch (e) {
        console.error(e);
    }
})();
