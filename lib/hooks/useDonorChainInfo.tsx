import { useQuery } from '@tanstack/react-query';

import currentChain from 'lib/web3/currentChain';

// CoinGecko coin IDs for donor chains
const COINGECKO_IDS: Record<string, string> = {
  RVN: 'ravencoin',
  BCH: 'bitcoin-cash',
  DOGE: 'dogecoin',
  LTC: 'litecoin',
};

const COINGECKO_SIMPLE_PRICE_URL = 'https://api.coingecko.com/api/v3/simple/price';

export interface DonorChainInfo {
  powHash: string;
  powId: number;
  powIdName: string;
  bits: number;
  blockTarget: string;
  meetsBlockDifficulty: boolean;
  difficultyPct: number;
  error?: string;
}

interface JsonRpcResponse {
  jsonrpc: string;
  id: number;
  result?: DonorChainInfo;
  error?: {
    code: number;
    message: string;
  };
}

// Extract workshare hash from coinbase transaction raw_input
// The workshare hash is the last 32 bytes (64 hex characters) of the data
export function extractWorkshareHash(rawInput: string): string | null {
  if (!rawInput || rawInput === '0x') {
    return null;
  }

  // Remove 0x prefix
  const hex = rawInput.startsWith('0x') ? rawInput.slice(2) : rawInput;

  // Workshare hash is last 32 bytes = 64 hex chars
  if (hex.length < 64) {
    return null;
  }

  return '0x' + hex.slice(-64);
}

export interface DonorChainReward {
  amount: string;
  amountNum: number;
  symbol: string;
}

// Get block reward based on donor chain
export function getDonorChainReward(powIdName: string): Array<DonorChainReward> {
  switch (powIdName) {
    case 'Kawpow':
      return [ { amount: '2,500', amountNum: 2500, symbol: 'RVN' } ];
    case 'SHA_BCH':
      return [ { amount: '3.125', amountNum: 3.125, symbol: 'BCH' } ];
    case 'Scrypt':
      // Scrypt handles both DOGE and LTC merged mining
      return [
        { amount: '10,000', amountNum: 10000, symbol: 'DOGE' },
        { amount: '6.25', amountNum: 6.25, symbol: 'LTC' },
      ];
    default:
      return [];
  }
}

interface CoinGeckoPriceResponse {
  [coinId: string]: {
    usd: number;
  };
}

// Hook to fetch current USD prices for donor chain rewards
export function useDonorChainPrices(symbols: Array<string>) {
  const coinIds = symbols
    .map((symbol) => COINGECKO_IDS[symbol])
    .filter(Boolean)
    .join(',');

  return useQuery<Record<string, number>>({
    queryKey: [ 'donor_chain_prices', coinIds ],
    queryFn: async() => {
      if (!coinIds) {
        return {};
      }

      try {
        const response = await fetch(
          `${ COINGECKO_SIMPLE_PRICE_URL }?ids=${ coinIds }&vs_currencies=usd`,
        );

        if (!response.ok) {
          throw new Error('Failed to fetch price data');
        }

        const data = await response.json() as CoinGeckoPriceResponse;

        // Map back to symbols
        const prices: Record<string, number> = {};
        for (const symbol of symbols) {
          const coinId = COINGECKO_IDS[symbol];
          if (coinId && data[coinId]) {
            prices[symbol] = data[coinId].usd;
          }
        }

        return prices;
      } catch (error) {
        console.error('Failed to fetch donor chain prices:', error);
        return {};
      }
    },
    enabled: symbols.length > 0,
    staleTime: 60000, // Cache prices for 1 minute
  });
}

export function useDonorChainInfo(workshareHash: string | null) {
  return useQuery<DonorChainInfo | null>({
    queryKey: [ 'donor_chain_info', workshareHash ],
    queryFn: async() => {
      if (!workshareHash) {
        return null;
      }

      try {
        const response = await fetch(currentChain.rpcUrls.public.http[0] + '/cyprus1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'quai_getDonorChainInfoForWorkshare',
            params: [ workshareHash ],
            id: 1,
          }),
        });

        const data = await response.json() as JsonRpcResponse;

        if (data.error) {
          console.error('RPC error:', data.error);
          return null;
        }

        return data.result || null;
      } catch (error) {
        console.error('Failed to fetch donor chain info:', error);
        return null;
      }
    },
    enabled: Boolean(workshareHash),
    staleTime: Infinity, // Workshare data doesn't change
  });
}
