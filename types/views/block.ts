import type { ArrayElement } from 'types/utils';

export const BLOCK_FIELDS_IDS = [
  'burnt_fees',
  'total_reward',
  'nonce',
  'miner',
  'totalEntropy',
  'manifestHash',
  'extRollupRoot',
  'evmRoot',
  'utxoRoot',
  'etxSetHash',
  'parentUncledDeltaEntropy',
  'efficiencyScore',
  'thresholdCount',
  'expansionNumber',
  'etxEligibleSlices',
  'primeTerminus',
  'interlinkRootHash',
  'uncledEntropy',
  'interlinkHashes',
] as const;

export type BlockFieldId = ArrayElement<typeof BLOCK_FIELDS_IDS>;
