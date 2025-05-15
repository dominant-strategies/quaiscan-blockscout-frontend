import { useQuery } from '@tanstack/react-query';
import type { Provider } from 'quais';
import { Interface } from 'quais';
import React from 'react';

import { getAbiFromIpfsWithTimeout } from 'lib/utils/abi';

interface UseDecodedMethodParams {
  to: string | null;
  data: string;
}

interface DecodedMethod {
  name: string;
  signature: string;
  params: Array<{
    name: string;
    type: string;
    value: unknown;
  }>;
}

// Cache for ABIs
const abiCache = new Map<string, Array<any>>();

// Common event signatures that might not be in the contract's ABI
const COMMON_EVENTS = [
  {
    // TransparentProxy Upgraded event
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'implementation',
        type: 'address',
      },
    ],
    name: 'Upgraded',
    type: 'event',
  },
  {
    // TransparentProxy AdminChanged event
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'previousAdmin',
        type: 'address',
      },
      {
        indexed: true,
        name: 'newAdmin',
        type: 'address',
      },
    ],
    name: 'AdminChanged',
    type: 'event',
  },
  {
    // TransparentProxy BeaconUpgraded event
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'beacon',
        type: 'address',
      },
    ],
    name: 'BeaconUpgraded',
    type: 'event',
  },
];

// Function to enhance ABI with common events
function enhanceAbiWithCommonEvents(abi: Array<any>): Array<any> {
  const eventNames = new Set(abi.filter(item => item.type === 'event').map(item => item.name));
  const enhancedAbi = [ ...abi ];

  COMMON_EVENTS.forEach(event => {
    if (!eventNames.has(event.name)) {
      enhancedAbi.push(event);
    }
  });

  return enhancedAbi;
}

export function useDecodedMethod({ to, data }: UseDecodedMethodParams, provider: Provider, options?: { enabled?: boolean }) {
  return useQuery<DecodedMethod | null>({
    queryKey: [ 'decoded_method', to, data ],
    queryFn: async() => {
      if (!to || !data || data === '0x') {
        return null;
      }

      try {
        // Check cache first
        let abi = abiCache.get(to);

        // If not in cache, fetch and store
        if (!abi) {
          abi = await getAbiFromIpfsWithTimeout(to, provider);
          if (abi) {
            abi = enhanceAbiWithCommonEvents(abi);
            abiCache.set(to, abi);
          }
        }

        if (!abi) {
          return null;
        }

        const iface = Interface.from(abi);

        // If data is a function signature (4 bytes), try to find the function name
        if (data.length === 10) { // 0x + 8 hex chars
          return {
            name: iface.getFunctionName(data),
            signature: data,
            params: [],
          };
        }

        // Otherwise try to parse as full transaction data
        const parsed = iface.parseTransaction({ data });
        if (!parsed) {
          return null;
        }

        return {
          name: parsed.name,
          signature: parsed.signature,
          params: parsed.args.map((arg: unknown, i: number) => ({
            name: parsed.fragment.inputs[i]?.name || `arg${ i }`,
            type: parsed.fragment.inputs[i]?.type || `arg${ i }`,
            value: arg,
          })),
        };
      } catch (error) {
        console.error('Failed to decode method:', error);
        return null;
      }
    },
    enabled: options?.enabled ?? Boolean(to && data && data !== '0x'),
  });
}

// New hook to get ABI for any address
export function useContractAbi(address: string | null, provider: Provider) {
  return useQuery<Array<any> | null>({
    queryKey: [ 'contract_abi', address, provider ],
    queryFn: async() => {
      if (!address) {
        return null;
      }

      try {
        // Check cache first
        const cachedAbi = abiCache.get(address);
        if (cachedAbi) {
          return cachedAbi;
        }

        // If not in cache, fetch and store
        const abi = await getAbiFromIpfsWithTimeout(address, provider);
        if (abi) {
          const enhancedAbi = enhanceAbiWithCommonEvents(abi);
          abiCache.set(address, enhancedAbi);
          return enhancedAbi;
        }
        return null;
      } catch (error) {
        console.error('Failed to fetch ABI:', error);
        return null;
      }
    },
    enabled: Boolean(address),
  });
}

// Hook to get ABIs for multiple addresses
export function useContractAbis(addresses: Array<string>, provider: Provider) {
  // Filter out any null/undefined addresses and ensure they're strings
  const validAddresses = React.useMemo(() => {
    return addresses.filter((addr): addr is string => Boolean(addr));
  }, [ addresses ]);

  // Create a single query for all addresses
  const queryKey = React.useMemo(() => {
    return [ 'contract_abis', ...validAddresses ];
  }, [ validAddresses ]);

  const { data: abiData } = useQuery<Map<string, Array<any> | null>>({
    queryKey,
    queryFn: async() => {
      const abiMap = new Map<string, Array<any> | null>();

      await Promise.all(validAddresses.map(async(address) => {
        try {
          // Check cache first
          const cachedAbi = abiCache.get(address);
          if (cachedAbi) {
            abiMap.set(address, cachedAbi);
            return;
          }

          // If not in cache, fetch and store
          const abi = await getAbiFromIpfsWithTimeout(address, provider);
          if (abi) {
            const enhancedAbi = enhanceAbiWithCommonEvents(abi);
            abiCache.set(address, enhancedAbi);
            abiMap.set(address, enhancedAbi);
          } else {
            abiMap.set(address, null);
          }
        } catch (error) {
          console.error(`Failed to fetch ABI for ${ address }:`, error);
          abiMap.set(address, null);
        }
      }));

      return abiMap;
    },
    enabled: validAddresses.length > 0,
  });

  return abiData || new Map<string, Array<any> | null>();
}

export const DECODED_METHOD_QUERY_KEY = [ 'decoded_method' ] as const;
