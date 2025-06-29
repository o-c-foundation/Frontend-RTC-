import { useEffect, useState, createContext, useContext } from "react";
import { Link } from "react-router";
import { useReadContract } from "wagmi";
import { isMobile } from "../../../utils";
import { EmbeddedTweet } from "react-tweet";
import ReactDOM from "react-dom";
import { useOverlay as useOverlayContext } from "./TokenList";
import { TOKEN_FACTORY_ADDRESS } from "../../../config/chain";

// TokenFactory ABI - 從之前看到的ABI文件中提取
const TOKEN_FACTORY_ABI = [
  {
    type: "function",
    name: "tokenCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokens",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "tokenAddress", type: "address", internalType: "address" },
      { name: "tokenName", type: "string", internalType: "string" },
      { name: "tokenSymbol", type: "string", internalType: "string" },
      { name: "totalSupply", type: "uint256", internalType: "uint256" },
      { name: "xUrl", type: "string", internalType: "string" },
      { name: "xUser", type: "string", internalType: "string" },
    ],
    stateMutability: "view",
  },
] as const;

interface Token {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  totalSupply: bigint;
  xUrl: string;
  xUser: string;
}

// 格式化大數字顯示 - 使用英文單位
const formatLargeNumber = (num: bigint): string => {
  const numValue = Number(num);

  if (numValue >= 1e18) {
    return (numValue / 1e18).toFixed(1) + "Q"; // Quintillion
  } else if (numValue >= 1e15) {
    return (numValue / 1e15).toFixed(1) + "P"; // Quadrillion
  } else if (numValue >= 1e12) {
    return (numValue / 1e12).toFixed(1) + "T"; // Trillion
  } else if (numValue >= 1e9) {
    return (numValue / 1e9).toFixed(1) + "B"; // Billion
  } else if (numValue >= 1e6) {
    return (numValue / 1e6).toFixed(1) + "M"; // Million
  } else if (numValue >= 1e3) {
    return (numValue / 1e3).toFixed(1) + "K"; // Thousand
  } else {
    return numValue.toLocaleString();
  }
};

// 縮短地址顯示
const shortenAddress = (address: string): string => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

interface TweetData {
  data: {
    text: string;
    created_at: string;
    user: {
      name: string;
      screen_name: string;
      profile_image_url_https: string;
      verified: boolean;
      is_blue_verified: boolean;
    };
    favorite_count: number;
    conversation_count: number;
  };
}

// Overlay context for modal overlays
export const OverlayContext = createContext({
  tweetUrl: null as string | null,
  pos: null as { x: number; y: number } | null,
  setOverlay: (_: {
    tweetUrl: string | null;
    pos: { x: number; y: number } | null;
  }) => {},
});
export const useOverlay = () => useContext(OverlayContext);
export const OverlayProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [tweetUrl, setTweetUrl] = useState<string | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const setOverlay = ({
    tweetUrl,
    pos,
  }: {
    tweetUrl: string | null;
    pos: { x: number; y: number } | null;
  }) => {
    setTweetUrl(tweetUrl);
    setPos(pos);
  };
  return (
    <OverlayContext.Provider value={{ tweetUrl, pos, setOverlay }}>
      {children}
    </OverlayContext.Provider>
  );
};

// Tweet Modal Component
const TweetModal = ({ isVisible }: { isVisible?: boolean }) => {
  const { tweetUrl, pos } = useOverlay();
  const [tweetId, setTweetId] = useState<string | null>(null);
  const [tweetData, setTweetData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (tweetUrl) {
      // Extract tweet ID from URL
      const id = tweetUrl.split("/").pop()?.split("?")[0];
      if (id) {
        setTweetId(id);
        setIsLoading(true);
        fetch(`https://react-tweet.vercel.app/api/tweet/${id}`, {
          headers: {
            accept: "*/*",
            origin: "https://axiom.trade",
            referer: "https://axiom.trade/",
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.data) {
              setTweetData(data.data);
            }
          })
          .catch(console.error)
          .finally(() => setIsLoading(false));
      }
    } else {
      setTweetId(null);
      setTweetData(null);
    }
  }, [tweetUrl]);

  if (!tweetUrl || !pos) return null;

  return (
    <div
      className="fixed z-[2147483647] w-[350px] bg-green-900 rounded-lg shadow-xl"
      style={{
        left: pos.x,
        top: pos.y - 8, // 8px above the icon
        transform: "translate(-50%, 0)",
        pointerEvents: "auto",
      }}
    >
      <div className="p-2" data-theme="dark">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        ) : tweetData ? (
          <div className="max-h-[600px] overflow-y-auto">
            <EmbeddedTweet tweet={tweetData} />
          </div>
        ) : (
          <div className="text-gray-400">Failed to load tweet</div>
        )}
      </div>
    </div>
  );
};

// 列表行組件
const TokenRow = ({ token, index }: { token: Token; index: number }) => {
  const { setOverlay } = useOverlay();

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setOverlay({
      tweetUrl: token.xUrl,
      pos: { x: rect.left + rect.width / 2, y: rect.bottom },
    });
  };

  const handleMouseLeave = () => {
    setOverlay({ tweetUrl: null, pos: null });
  };

  return (
    <div className="bg-gray-800/40 hover:bg-gray-700/60 border-b border-gray-700/50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10">
      <div className="grid grid-cols-12 gap-6 items-center py-6 px-8 text-base">
        {/* Rank & Logo */}
        <div className="col-span-1 text-gray-400 font-mono">#{index + 1}</div>

        {/* Token Name & Symbol */}
        <div className="col-span-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {token.tokenSymbol.charAt(0)}
            </div>
            <div>
              <div
                className="text-white font-semibold truncate max-w-32 text-lg"
                title={token.tokenName}
              >
                {token.tokenName}
              </div>
              <div className="text-cyan-400 font-mono text-sm text-start">
                {token.tokenSymbol}
              </div>
            </div>
          </div>
        </div>

        {/* Supply */}
        <div className="col-span-2">
          <div className="text-green-400 font-mono font-semibold text-lg">
            {formatLargeNumber(token.totalSupply)}
          </div>
          <div className="text-gray-500 text-sm">Total Supply</div>
        </div>

        {/* Creator */}
        <div className="col-span-2">
          <div
            className="text-yellow-400 font-medium truncate text-lg"
            title={token.xUser}
          >
            {token.xUser}
          </div>
          <div className="text-gray-500 text-sm">Creator</div>
        </div>

        {/* Contract Address */}
        <div className="col-span-2">
          <div
            className="text-gray-300 font-mono text-sm"
            title={token.tokenAddress}
          >
            {shortenAddress(token.tokenAddress)}
          </div>
          <div className="text-gray-500 text-sm">Contract</div>
        </div>

        {/* X Link */}
        <div className="col-span-1">
          {token.xUrl ? (
            <div className="relative">
              <a
                href={token.xUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
                title="View on X.com"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          ) : (
            <div className="text-gray-600">-</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="col-span-2 flex gap-3">
          <Link
            to={`/connect-wallet?token=${token.tokenAddress}&index=${index}`}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/50 whitespace-nowrap"
          >
            Claim
          </Link>
          <Link
            to={`/trade?token=${token.tokenAddress}&name=${encodeURIComponent(
              token.tokenName
            )}&symbol=${encodeURIComponent(token.tokenSymbol)}`}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/50 whitespace-nowrap"
          >
            Trade
          </Link>
        </div>
      </div>
    </div>
  );
};

// 組件用於獲取單個token數據
const TokenFetcher = ({
  index,
  onTokenFetched,
}: {
  index: number;
  onTokenFetched: (token: Token, index: number) => void;
}) => {
  const { data: tokenData } = useReadContract({
    address: TOKEN_FACTORY_ADDRESS,
    abi: TOKEN_FACTORY_ABI,
    functionName: "tokens",
    args: [BigInt(index)],
  });

  useEffect(() => {
    if (tokenData && Array.isArray(tokenData) && tokenData.length === 6) {
      const [tokenAddress, tokenName, tokenSymbol, totalSupply, xUrl, xUser] =
        tokenData;
      // 確保 xUrl 是有效的 Twitter/X 鏈接
      const validXUrl =
        (xUrl as string)?.startsWith("https://twitter.com/") ||
        (xUrl as string)?.startsWith("https://x.com/")
          ? (xUrl as string)
          : "";

      const token: Token = {
        tokenAddress: tokenAddress as string,
        tokenName: tokenName as string,
        tokenSymbol: tokenSymbol as string,
        totalSupply: totalSupply as bigint,
        xUrl: validXUrl,
        xUser: xUser as string,
      };

      onTokenFetched(token, index);
    }
  }, [tokenData, index, onTokenFetched]);

  return null; // 這個組件不渲染任何內容
};

export const TokenList = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [fetchedIndices, setFetchedIndices] = useState<Set<number>>(new Set());

  // 獲取token數量
  const { data: tokenCount, isLoading: isLoadingCount } = useReadContract({
    address: TOKEN_FACTORY_ADDRESS,
    abi: TOKEN_FACTORY_ABI,
    functionName: "tokenCount",
  });

  const handleTokenFetched = (token: Token, index: number) => {
    if (!fetchedIndices.has(index)) {
      setTokens((prev) => {
        const newTokens = [...prev];
        newTokens[index] = token;
        return newTokens;
      });
      setFetchedIndices((prev) => new Set(prev).add(index));
    }
  };

  // 重置tokens當tokenCount改變
  useEffect(() => {
    if (tokenCount) {
      setTokens([]);
      setFetchedIndices(new Set());
    }
  }, [tokenCount]);

  if (isMobile) {
    return (
      <p className="text-red-400 w-full block mt-3">
        Mobile is not supported. <br /> Please use desktop browser.
      </p>
    );
  }

  if (isLoadingCount) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-white text-2xl font-medium">🎮 Loading tokens...</div>
      </div>
    );
  }

  if (!tokenCount || Number(tokenCount) === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-8">
        <div className="text-center">
          <div className="text-8xl mb-6">🎮</div>
          <div className="text-white text-2xl mb-3 font-semibold">
            No tokens available yet!
          </div>
          <div className="text-gray-400 text-lg">
            Be the first creator to mint a token
          </div>
        </div>
        <Link
          to="welcome"
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/50"
        >
          🚀 Create First Token
        </Link>
      </div>
    );
  }

  const count = Number(tokenCount);

  return (
    <div className="w-full h-full flex flex-col">
      {/* 創建TokenFetcher組件來獲取每個token */}
      {Array.from({ length: count }, (_, index) => (
        <TokenFetcher
          key={index}
          index={index}
          onTokenFetched={handleTokenFetched}
        />
      ))}

      {/* Table Header */}
      <div className="bg-gray-900/70 border-b border-gray-700/50 backdrop-blur-sm">
        <div className="grid grid-cols-12 gap-6 items-center py-5 px-8 text-sm font-bold text-gray-300 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-2">Token</div>
          <div className="col-span-2">Supply</div>
          <div className="col-span-2">Creator</div>
          <div className="col-span-2">Contract</div>
          <div className="col-span-1">Social</div>
          <div className="col-span-2">Actions</div>
        </div>
      </div>

      {/* Loading state */}
      {tokens.length === 0 && !isLoadingCount && (
        <div className="flex justify-center items-center h-40">
          <div className="text-gray-400 text-xl font-medium">
            ⏳ Loading token details...
          </div>
        </div>
      )}

      {/* Token List */}
      <div className="flex-1 overflow-auto bg-gray-800/20 border-gray-700/50">
        {tokens.map(
          (token, index) =>
            token && <TokenRow key={index} token={token} index={index} />
        )}
      </div>
    </div>
  );
};

export { TweetModal };
