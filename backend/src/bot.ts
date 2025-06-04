import { TwitterApi } from "twitter-api-v2";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { TOKEN_FACTORY_ADDRESS, TOKEN_FACTORY_ABI } from "./abi";
import { suggestToken, deployToken } from "./utils";
import dotenv from "dotenv";

dotenv.config();

// For polling/searching (OAuth 2.0 Bearer Token)
const appClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);

// For posting/replying as the bot (OAuth 1.0a User Context)
const userClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_SECRET!,
});

// viem public client for checking token existence
const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL!),
});

// Poll mentions timeline
async function startBot() {
  try {
    console.log("Getting bot user info...");
    const me = await userClient.v2.me();
    const botId = me.data.id;
    console.log("Bot ID:", botId);
    let sinceId: string | undefined = undefined;

    console.log("Bot started! Polling for mentions...");
    let consecutiveRateLimits = 0;

    while (true) {
      let sleepMs = 30000; // default sleep 30s (reduced API calls)
      try {
        const now = new Date();
        // Look back only 60 seconds instead of 10 minutes to reduce overlap
        const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
        const startTime = oneMinuteAgo.toISOString().split(".")[0] + "Z";
        console.log("Checking for mentions since", startTime);

        const mentionParams: any = {
          "tweet.fields": [
            "referenced_tweets",
            "author_id",
            "in_reply_to_user_id",
            "created_at",
          ],
          expansions: ["referenced_tweets.id", "author_id"],
          max_results: 5, // Minimal result size to reduce API usage further
        };
        
        // Use sinceId if available instead of time-based filtering
        if (sinceId) {
          mentionParams.since_id = sinceId;
        } else {
          mentionParams.start_time = startTime;
        }
        
        const mentions = await userClient.v2.userMentionTimeline(botId, mentionParams);
        if (mentions.data?.data && mentions.data.data.length > 0) {
          console.log(`Found ${mentions.data.data.length} mentions to process`);
          
          // Sort tweets by ID to get the newest one for sinceId
          const sortedTweets = [...mentions.data.data].sort((a, b) => 
            BigInt(b.id) - BigInt(a.id)
          );
          
          // Update sinceId to most recent tweet
          sinceId = sortedTweets[0].id;
          console.log("Updated sinceId to:", sinceId);
          
          // Process each mention (newest first)
          for (const tweet of sortedTweets) {
          if (
            tweet.referenced_tweets?.some(
              (ref: any) => ref.type === "replied_to"
            )
          ) {
            const originalTweetId = tweet.referenced_tweets.find(
              (ref: any) => ref.type === "replied_to"
            )?.id;
            if (originalTweetId) {
              // Fetch the original tweet (with app context)
              const originalTweet = await appClient.v2.singleTweet(
                originalTweetId,
                {
                  "tweet.fields": ["author_id", "text"],
                  expansions: ["author_id"],
                }
              );
              const tweetText = originalTweet.data?.text || "";
              const originalAuthor = originalTweet.includes?.users?.[0];
              const xUrl = `https://x.com/${originalAuthor?.username}/status/${originalTweetId}`;
              const xUser = originalAuthor?.username || "";

              // 1. Suggest token
              let symbol = "MEME";
              let name = "MemeCoin";
              try {
                const suggestion = await suggestToken(tweetText);
                symbol = suggestion.symbol;
                name = suggestion.name;
              } catch (e) {
                console.error("OpenAI suggestion failed", e);
                throw e;
              }

              // 3. Deploy token using util
              let hash = "";
              let tokenAddress = "";
              try {
                const deployed = await deployToken(name, symbol, xUrl, xUser);
                hash = deployed.hash;
                tokenAddress = deployed.tokenAddress;
              } catch (e) {
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
      // Always maintain a consistent 30 second polling interval
      sleepMs = 30000; // Fixed 30s polling interval
      consecutiveRateLimits = 0; // Reset counter on success
      } catch (error: any) {
        if (error.code === 429) {
          // Implement exponential backoff for rate limits
          consecutiveRateLimits++;
          const resetTime = error.rateLimit?.reset * 1000; // Convert to ms
          const now = Date.now();
          let baseWaitTime = resetTime ? resetTime - now : 60000; // Default to 1 min if no reset time
          
          // Add exponential component capped at 15 minutes max
          const exponentialWait = Math.min(Math.pow(2, consecutiveRateLimits) * 1000, 15 * 60 * 1000);
          sleepMs = baseWaitTime + exponentialWait;
          
          console.log(`Rate limited (${consecutiveRateLimits} consecutive). Sleeping for ${Math.floor(sleepMs / 1000)} seconds until ${new Date(now + sleepMs).toISOString()}`);
        } else {
          console.error("Error processing mentions:", error);
        }
      }
      // Sleep for the determined time
      await new Promise((resolve) => setTimeout(resolve, sleepMs));
    }
  } catch (error) {
    console.error("Error starting bot:", error);
  }
}

// Start the bot
startBot();
