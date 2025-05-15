import { useQuery } from '@tanstack/react-query';

interface CoinGeckoPriceResponse {
  prices: Array<[number, number]>; // [timestamp, price]
  market_caps: Array<[number, number]>;
  total_volumes: Array<[number, number]>;
}

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/coins/quai-network/market_chart/range?vs_currency=usd';

export function useQuaiPrice(timestamp: string | number | null | undefined) {
  return useQuery<string | null>({
    queryKey: [ 'quai_price', timestamp ],
    queryFn: async() => {
      if (!timestamp) {
        return null;
      }

      try {
        // Parse the ISO timestamp
        const date = new Date(timestamp);
        if (isNaN(date.getTime()) || date.getFullYear() < 2025) {
          console.warn('Invalid timestamp format:', timestamp);
          return null;
        }

        // Get the date in UTC
        const startDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
        const endDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));

        const response = await fetch(
          `${ COINGECKO_API_URL }&from=${ Math.floor(startDate.getTime() / 1000) }&to=${ Math.floor(endDate.getTime() / 1000) }`,
        );

        if (!response.ok) {
          throw new Error('Failed to fetch price data');
        }

        const data = await response.json() as CoinGeckoPriceResponse;

        // Get the first price of the day (or the only price if there's just one)
        if (data.prices.length === 0) {
          return null;
        }
        return data.prices[0][1].toString();
      } catch (error) {
        console.error('Failed to fetch Quai price:', error);
        return null;
      }
    },
    enabled: Boolean(timestamp),
  });
}
