"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestToken = suggestToken;
exports.deployToken = deployToken;
const openai_1 = require("openai");
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const accounts_1 = require("viem/accounts");
const abi_1 = require("./abi");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const openai = new openai_1.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// viem clients for Base mainnet
const publicClient = (0, viem_1.createPublicClient)({
    chain: chains_1.base,
    transport: (0, viem_1.http)(process.env.BASE_RPC_URL),
});
const account = (0, accounts_1.privateKeyToAccount)(process.env.DEPLOYER_PRIVATE_KEY);
const walletClient = (0, viem_1.createWalletClient)({
    account,
    chain: chains_1.base,
    transport: (0, viem_1.http)(process.env.BASE_RPC_URL),
});
async function suggestToken(text) {
    const prompt = `Suggest a meme coin token symbol (all caps, <=7 chars) and name (<=15 chars) for this viral tweet. Respond in JSON: {"symbol": "...", "name": "..."}\nTweet: "${text}"`;
    const chat = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0.7,
    });
    const response = chat.choices[0].message.content;
    try {
        return JSON.parse(response);
    }
    catch (e) {
        // fallback: extract with regex
        const match = response?.match(/\{[^}]+\}/);
        if (match)
            return JSON.parse(match[0]);
        throw new Error("Failed to parse OpenAI response: " + response);
    }
}
async function deployToken(name, symbol, xUrl, xUser) {
    const hash = await walletClient.writeContract({
        address: abi_1.TOKEN_FACTORY_ADDRESS,
        abi: abi_1.TOKEN_FACTORY_ABI,
        functionName: "deployERC20Token",
        args: [name, symbol, xUrl, xUser],
        value: 0n,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    // Try to get the token address from the contract
    const tokenInfo = await publicClient.readContract({
        address: abi_1.TOKEN_FACTORY_ADDRESS,
        abi: abi_1.TOKEN_FACTORY_ABI,
        functionName: "getTokenByXUrl",
        args: [xUrl],
    });
    console.log("Token deployed", tokenInfo.tokenAddress);
    return { hash, tokenAddress: tokenInfo.tokenAddress };
}
