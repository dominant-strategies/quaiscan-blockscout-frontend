import type { AddressParam } from 'types/api/addressParams';
import type { Reward } from 'types/api/reward';
import type { ExternalTransaction, Transaction, UtxoTransaction } from 'types/api/transaction';

export type BlockType = 'block' | 'reorg' | 'uncle';

export interface Block {
  height: number;
  timestamp: string;
  tx_count: number;
  miner: AddressParam;
  size: number;
  hash: string;
  parent_hash: string;
  difficulty: string;
  total_difficulty: string | null;
  gas_used: string | null;
  gas_limit: string;
  nonce: string;
  base_fee_per_gas: string | null;
  burnt_fees: string | null;
  priority_fee: string | null;
  extra_data: string | null;
  state_root: string | null;
  rewards?: Array<Reward>;
  gas_target_percentage: number | null;
  gas_used_percentage: number | null;
  burnt_fees_percentage: number | null;
  type: BlockType;
  tx_fees: string | null;
  uncles_hashes: Array<string>;
  withdrawals_count?: number;
  // ROOTSTOCK FIELDS
  bitcoin_merged_mining_coinbase_transaction?: string | null;
  bitcoin_merged_mining_header?: string | null;
  bitcoin_merged_mining_merkle_proof?: string | null;
  hash_for_merged_mining?: string | null;
  minimum_gas_price?: string | null;
  // BLOB FIELDS
  blob_gas_price?: string;
  blob_gas_used?: string;
  burnt_blob_fees?: string;
  excess_blob_gas?: string;
  blob_tx_count?: number;
  // QUAI FIELDS
  manifest_hash_full?: Array<string>;
  number_full?: Array<string>;
  parent_hash_full?: Array<string>;
  ext_rollup_root?: string;
  transactions_root?: string;
  ext_transactions_root?: string;
  sub_manifest?: string;
  location?: string;
  total_entropy?: string;
  parent_entropy?: string;
  parent_delta_s?: string;
  parent_entropy_full?: Array<string>;
  parent_delta_s_full?: Array<string>;
  ext_tx_count?: number;
  evm_root?: Array<string>;
  utxo_root?: Array<string>;
  etx_set_root?: Array<string>;
  parent_uncled_sub_delta_s?: Array<string>;
  efficiency_score?: string;
  threshold_count?: string;
  expansion_number?: string;
  etx_eligible_slices?: string;
  prime_terminus?: string;
  interlink_root_hash?: Array<string>;
  uncled_s?: string;
  interlink_hashes?: string;
  wo_header?: WoHeader;

  // Shard ID
  shard_id?: string;
}

export interface BlocksResponse {
  items: Array<Block>;
  next_page_params: {
    block_number: number;
    items_count: number;
  } | null;
}

export interface BlockTransactionsResponse {
  items: Array<Transaction>;
  next_page_params: {
    block_number: number;
    items_count: number;
    index: number;
  } | null;
}

export interface BlockExternalTransactionsResponse {
  items: Array<ExternalTransaction>;
  next_page_params: {
    block_number: number;
    items_count: number;
    index: number;
  } | null;
}

export interface BlockUtxoTransactionsResponse {
  items: Array<UtxoTransaction>;
  next_page_params: {
    block_number: number;
    items_count: number;
    index: number;
  } | null;
}

export interface NewBlockSocketResponse {
  average_block_time: string;
  block: Block;
}

export interface BlockFilters {
  type?: BlockType;
}

export type BlockWithdrawalsResponse = {
  items: Array<BlockWithdrawalsItem>;
  next_page_params: {
    index: number;
    items_count: number;
  } | null;
};

export type BlockWithdrawalsItem = {
  amount: string;
  index: number;
  receiver: AddressParam;
  validator_index: number;
};

export type WoHeader = {
  difficulty: number;
  headerHash: string;
  location: string;
  mixHash: string;
  nonce: number;
  number: number;
  parentHash: string;
  timestamp: string;
  txHash: string;
};
