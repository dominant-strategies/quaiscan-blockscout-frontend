import { JsonRpcProvider } from 'quais';
import { createPublicClient, http } from 'viem';

import { getFeaturePayload } from 'configs/app/features/types';

import config from 'configs/app';

import currentChain from './currentChain';

function getPublicClient() {
  if (currentChain.rpcUrls.public.http.filter(Boolean).length === 0) {
    return;
  }

  try {
    return createPublicClient({
      chain: currentChain,
      transport: http(),
      batch: {
        multicall: true,
      },
    });
  } catch (error) {}
}

function getPublicQuaisProvider() {
  if (currentChain.rpcUrls.public.http.filter(Boolean).length === 0) {
    throw new Error('No public RPC URL found');
  }

  return new JsonRpcProvider(currentChain.rpcUrls.public.http[0]);
}

function getPublicDebugQuaisProvider() {
  if (currentChain.rpcUrls.debug.http.filter(Boolean).length === 0) {
    throw new Error('No public RPC URL found');
  }
  return new JsonRpcProvider(currentChain.rpcUrls.debug.http[0]);
}

export const publicQuaisProvider = getPublicQuaisProvider();
export const publicDebugQuaisProvider = getPublicDebugQuaisProvider();

export const publicClient = getPublicClient();

export const getShardPublicClient = (shardId?: string) => {
  if (!shardId) {
    return;
  }

  const shard = config.features.shards.isEnabled ?
    getFeaturePayload(config.features.shards)?.shards[shardId] :
    undefined;

  if (!shard) {
    return;
  }

  try {
    return createPublicClient({
      chain: { ...currentChain, ...shard.chain },
      transport: http(shard.apiHost),
      batch: {
        multicall: true,
      },
    });
  } catch (error) {}
};
