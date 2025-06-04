"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const twitter_api_v2_1 = require("twitter-api-v2");
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const utils_1 = require("./utils");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// For polling/searching (OAuth 2.0 Bearer Token)
const appClient = new twitter_api_v2_1.TwitterApi(process.env.TWITTER_BEARER_TOKEN);
// For posting/replying as the bot (OAuth 1.0a User Context)
const userClient = new twitter_api_v2_1.TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
});
// viem public client for checking token existence
const publicClient = (0, viem_1.createPublicClient)({
    chain: chains_1.base,
    transport: (0, viem_1.http)(process.env.BASE_RPC_URL),
});
// Poll mentions timeline
async function startBot() {
    try {
        console.log("Getting bot user info...");
        const me = await userClient.v2.me();
        const botId = me.data.id;
        console.log("Bot ID:", botId);
        let sinceId = undefined;
        console.log("Bot started! Polling for mentions...");
        while (true) {
            let sleepMs = 5000; // default sleep 5s
            try {
                const now = new Date();
                const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
                const startTime = tenMinutesAgo.toISOString().split(".")[0] + "Z";
                console.log("startTime", startTime);
                const mentions = await userClient.v2.userMentionTimeline(botId, {
                    "tweet.fields": [
                        "referenced_tweets",
                        "author_id",
                        "in_reply_to_user_id",
                        "created_at",
                    ],
                    expansions: ["referenced_tweets.id", "author_id"],
                    max_results: 50,
                    start_time: startTime,
                });
                if (mentions.data?.data && mentions.data.data.length > 0) {
                    console.log("mentions data:", mentions.data?.data);
                    // Get the most recent tweet (first in the array)
                    const tweet = mentions.data.data[0];
                    sinceId = tweet.id;
                    if (tweet.referenced_tweets?.some((ref) => ref.type === "replied_to")) {
                        const originalTweetId = tweet.referenced_tweets.find((ref) => ref.type === "replied_to")?.id;
                        if (originalTweetId) {
                            // Fetch the original tweet (with app context)
                            const originalTweet = await appClient.v2.singleTweet(originalTweetId, {
                                "tweet.fields": ["author_id", "text"],
                                expansions: ["author_id"],
                            });
                            const tweetText = originalTweet.data?.text || "";
                            const originalAuthor = originalTweet.includes?.users?.[0];
                            const xUrl = `https://x.com/${originalAuthor?.username}/status/${originalTweetId}`;
                            const xUser = originalAuthor?.username || "";
                            // 1. Suggest token
                            let symbol = "MEME";
                            let name = "MemeCoin";
                            try {
                                const suggestion = await (0, utils_1.suggestToken)(tweetText);
                                symbol = suggestion.symbol;
                                name = suggestion.name;
                            }
                            catch (e) {
                                console.error("OpenAI suggestion failed", e);
                                throw e;
                            }
                            // 3. Deploy token using util
                            let hash = "";
                            let tokenAddress = "";
                            try {
                                const deployed = await (0, utils_1.deployToken)(name, symbol, xUrl, xUser);
                                hash = deployed.hash;
                                tokenAddress = deployed.tokenAddress;
                            }
                            catch (e) {
                                console.error("Token deployment failed.", e);
                                throw e;
                            }
                            // 4. Reply to user with emojis
                            const replyText = `🚀 Your token is live!\n\n💎 Name: ${name}\n💫 Symbol: ${symbol}\n🔗 Address: ${tokenAddress}\n\nLFG! 🚀`;
                            await userClient.v2.reply(replyText, tweet.id);
                            console.log("✨ Replied to user with token details");
                        }
                    }
                }
            }
            catch (error) {
                if (error.code === 429 && error.rateLimit?.reset) {
                    const now = Math.floor(Date.now() / 1000);
                    const reset = Number(error.rateLimit.reset);
                    const waitSec = Math.max(reset - now, 1);
                    sleepMs = waitSec * 1000;
                    console.warn(`Rate limited. Sleeping for ${waitSec} seconds until reset at ${reset}`);
                }
                else {
                    console.error("Error processing mentions:", error);
                }
            }
            // Sleep for the determined time
            await new Promise((resolve) => setTimeout(resolve, sleepMs));
        }
    }
    catch (error) {
        console.error("Error starting bot:", error);
    }
}
// Start the bot
startBot();
