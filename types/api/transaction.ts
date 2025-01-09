import type { AddressParam } from './addressParams';
import type { BlockTransactionsResponse, BlockExternalTransactionsResponse } from './block';
import type { DecodedInput } from './decodedInput';
import type { Fee } from './fee';
import type { OptimisticL2WithdrawalStatus } from './optimisticL2';
import type { TokenInfo } from './token';
import type { TokenTransfer } from './tokenTransfer';
import type { TxAction } from './txAction';

export type TransactionRevertReason =
  | {
    raw: string;
  }
  | DecodedInput;

type WrappedTransactionFields =
  | 'decoded_input'
  | 'fee'
  | 'gas_limit'
  | 'gas_price'
  | 'hash'
  | 'max_fee_per_gas'
  | 'max_priority_fee_per_gas'
  | 'method'
  | 'nonce'
  | 'raw_input'
  | 'to'
  | 'type'
  | 'value';

export interface OpWithdrawal {
  l1_transaction_hash: string;
  nonce: number;
  status: OptimisticL2WithdrawalStatus;
}

export type OutboundInbound = {
  inbound: InboundTransaction | null;
  outbound: OutboundTransaction;
};

export type InboundTransaction = {
  block_hash: string;
  block_timestamp: string | null;
  chain_id: string | null;
  cumulative_gas_used: string;
  from_address: string;
  gas: string;
  gas_price: string;
  gas_used: string;
  hash: string;
  index: number;
  max_fee_per_gas: string | null;
  max_priority_fee_per_gas: string | null;
  nonce: number;
  status: 'ok' | 'error' | null;
  to_address: string;
  type: number;
  value: string;
};

export type OutboundTransaction = {
  from_address: string;
  gas: string;
  hash: string;
  to_address: string;
  transaction_index: number;
  value: string;
}

export type Transaction = {
  to: AddressParam | null;
  created_contract: AddressParam | null;
  hash: string;
  result: string;
  confirmations: number;
  status: 'ok' | 'error' | 'pending' | null | undefined;
  block: number | null;
  timestamp: string | null;
  confirmation_duration: Array<number> | null;
  from: AddressParam;
  value: string;
  fee: Fee;
  gas_price: string | null;
  type: number | null;
  gas_used: string | null;
  gas_limit: string;
  max_fee_per_gas: string | null;
  max_priority_fee_per_gas: string | null;
  priority_fee: string | null;
  base_fee_per_gas: string | null;
  tx_burnt_fee: string | null;
  nonce: number;
  position: number | null;
  revert_reason: TransactionRevertReason | null;
  raw_input: string;
  decoded_input: DecodedInput | null;
  token_transfers: Array<TokenTransfer> | null;
  token_transfers_overflow: boolean;
  exchange_rate: string | null;
  method: string | null;
  tx_types: Array<TransactionType>;
  tx_tag: string | null;
  actions: Array<TxAction>;
  l1_fee?: string;
  l1_fee_scalar?: string;
  l1_gas_price?: string;
  l1_gas_used?: string;
  has_error_in_internal_txs: boolean | null;
  // optimism fields
  op_withdrawals?: Array<OpWithdrawal>;
  // SUAVE fields
  execution_node?: AddressParam | null;
  allowed_peekers?: Array<string>;
  wrapped?: Pick<Transaction, WrappedTransactionFields>;
  // Stability fields
  stability_fee?: {
    dapp_address: AddressParam;
    dapp_fee: string;
    token: TokenInfo;
    total_fee: string;
    validator_address: AddressParam;
    validator_fee: string;
  };
  // zkEvm fields
  zkevm_verify_hash?: string;
  zkevm_batch_number?: number;
  zkevm_status?: (typeof ZKEVM_L2_TX_STATUSES)[number];
  zkevm_sequence_hash?: string;
  // blob tx fields
  blob_versioned_hashes?: Array<string>;
  blob_gas_used?: string;
  blob_gas_price?: string;
  burnt_blob_fee?: string;
  max_fee_per_blob_gas?: string;
  // Shard ID
  shard_id?: string;
  // UTXO fields
  inputs?: Array<{
    PreviousOutPoint: {
      Index: number;
      TxHash: string;
    };
    PubKey: string;
  }>;
  outputs?: Array<{
    Address: string;
    Denomination: number;
    Lock: number;
  }>;
  is_etx?: boolean;
  etx_type?: 'coinbase' | 'conversion' | 'external';
};

export type ExternalTransaction = {
  to: AddressParam | null;
  created_contract: AddressParam | null;
  hash: string;
  result: string;
  confirmations: number;
  status: 'ok' | 'error' | null | undefined;
  block: number | null;
  timestamp: string | null;
  confirmation_duration: Array<number> | null;
  from: AddressParam;
  value: string;
  gas_price: string | null;
  type: number | null;
  gas_used: string | null;
  gas_limit: string;
  max_fee_per_gas: string | null;
  max_priority_fee_per_gas: string | null;
  priority_fee: string | null;
  base_fee_per_gas: string | null;
  tx_burnt_fee: string | null;
  nonce: number;
  position: number | null;
  revert_reason: TransactionRevertReason | null;
  raw_input: string;
  decoded_input: DecodedInput | null;
  token_transfers: Array<TokenTransfer> | null;
  token_transfers_overflow: boolean;
  exchange_rate: string | null;
  method: string | null;
  tx_types: Array<TransactionType>;
  tx_tag: string | null;
  actions: Array<TxAction>;
  l1_fee?: string;
  l1_fee_scalar?: string;
  l1_gas_price?: string;
  l1_gas_used?: string;
  has_error_in_internal_txs: boolean | null;
  // optimism fields
  op_withdrawals?: Array<OpWithdrawal>;
  // SUAVE fields
  execution_node?: AddressParam | null;
  allowed_peekers?: Array<string>;
  wrapped?: Pick<Transaction, WrappedTransactionFields>;
  // Stability fields
  stability_fee?: {
    dapp_address: AddressParam;
    dapp_fee: string;
    token: TokenInfo;
    total_fee: string;
    validator_address: AddressParam;
    validator_fee: string;
  };
  // zkEvm fields
  zkevm_verify_hash?: string;
  zkevm_batch_number?: number;
  zkevm_status?: (typeof ZKEVM_L2_TX_STATUSES)[number];
  zkevm_sequence_hash?: string;
  // blob tx fields
  blob_versioned_hashes?: Array<string>;
  blob_gas_used?: string;
  blob_gas_price?: string;
  burnt_blob_fee?: string;
  max_fee_per_blob_gas?: string;
};

export type UtxoTransaction = {
  hash: string;
  block_hash: string;
  block_number: number;
  gas: string;
  index: number;
  input: string;
  utxoSignature: string | null; // TODO: should be always provided
  type: number | null;
  nonce: number;
  inputs: Array<{
    PreviousOutPoint: {
      Index: number;
      TxHash: string;
    };
    PubKey: string;
  }>;
  outputs: Array<{
    Address: string;
    Denomination: number;
    Lock: number;
  }>;
};

export const ZKEVM_L2_TX_STATUSES = [ 'Confirmed by Sequencer', 'L1 Confirmed' ];

export type TransactionsResponse = TransactionsResponseValidated | TransactionsResponsePending;

export interface ExternalTransactionsResponse {
  items: Array<ExternalTransaction>;
  next_page_params: {
    block_number: number;
    index: number;
    items_count: number;
  } | null;
}

export interface TransactionsResponseValidated {
  items: Array<Transaction>;
  next_page_params: {
    block_number: number;
    index: number;
    items_count: number;
    filter: 'validated';
  } | null;
}

export interface TransactionsResponsePending {
  items: Array<Transaction>;
  next_page_params: {
    inserted_at: string;
    hash: string;
    filter: 'pending';
  } | null;
}

export interface TransactionsResponseWithBlobs {
  items: Array<Transaction>;
  next_page_params: {
    block_number: number;
    index: number;
    items_count: number;
  } | null;
}

export interface TransactionsResponseWatchlist {
  items: Array<Transaction>;
  next_page_params: {
    block_number: number;
    index: number;
    items_count: 50;
  } | null;
}

export type TransactionType =
  | 'rootstock_remasc'
  | 'rootstock_bridge'
  | 'token_transfer'
  | 'contract_creation'
  | 'contract_call'
  | 'token_creation'
  | 'coin_transfer'
  | 'blob_transaction'
  | 'coinbase'
  | 'conversion'
  | 'external'
  | 'utxo_transaction';

export type TxsResponse = TransactionsResponseValidated | TransactionsResponsePending | BlockTransactionsResponse;
export type ExtTxsResponse = ExternalTransactionsResponse | BlockExternalTransactionsResponse;

export interface TransactionsSorting {
  sort: 'value' | 'fee';
  order: 'asc' | 'desc';
}

export type TransactionsSortingField = TransactionsSorting['sort'];

export type TransactionsSortingValue = `${ TransactionsSortingField }-${ TransactionsSorting['order'] }`;

export function normalizeOutboundInboundToTransaction(data: OutboundInbound, etxType: 'external' | 'coinbase' | 'conversion'): Transaction {
  const getCurrency = (address: string): string => {
    const fifthChar = address[4]; // The fifth character (index 4) including `0x`
    const hexValue = parseInt(fifthChar, 16); // Convert hex to a number
    return hexValue > 7 ? 'qi' : 'quai';
  };

  const createAddressParam = (hash: string): AddressParam => ({
    hash,
    implementation_name: null,
    name: null,
    is_contract: false,
    is_verified: null,
    ens_domain_name: null,
    currency: getCurrency(hash),
    private_tags: null,
    watchlist_names: null,
    public_tags: null,
  });

  const status =
      // eslint-disable-next-line no-nested-ternary
      data.inbound?.status === 'ok' ?
        'ok' :
        data.inbound ?
          'error' :
          'pending';
  const result =
      // eslint-disable-next-line no-nested-ternary
      data.inbound?.status === 'ok' ?
        'ok' :
        data.inbound ?
          'error' :
          'pending';
  return {
    to: createAddressParam(data.outbound.to_address),
    from: createAddressParam(data.outbound.from_address),
    created_contract: null,
    hash: data.outbound.hash,
    confirmations: 0, // No confirmation logic provided; defaulting to 0
    status,
    result,
    block: data.inbound?.block_hash ?
      parseInt(data.inbound.block_hash, 16) :
      null, // Convert block hash to a number if present
    timestamp: data.inbound?.block_timestamp || null,
    confirmation_duration: null, // Not specified, defaulting to null
    value: data.outbound.value,
    fee: {
      type: '',
      value: null,
    },
    gas_price: data.inbound?.gas_price || '0',
    gas_used: data.inbound?.gas_used || data.outbound.gas,
    gas_limit: data.inbound?.gas || data.outbound.gas,
    max_fee_per_gas: data.inbound?.max_fee_per_gas || null,
    max_priority_fee_per_gas: data.inbound?.max_priority_fee_per_gas || null,
    priority_fee: null, // Not mapped
    base_fee_per_gas: null, // Not mapped
    tx_burnt_fee: null, // Not mapped
    nonce: data.inbound?.nonce || 0,
    position: null, // Not specified
    revert_reason: null, // Not mapped
    raw_input: '0x', // Simple placeholder for raw input
    decoded_input: null, // Not mapped
    token_transfers: null, // Not mapped
    token_transfers_overflow: false, // Defaulting to false
    exchange_rate: null, // Not mapped
    method: null, // Not mapped
    tx_types: [ etxType ], // Defaulting to empty
    tx_tag: null, // Not mapped
    actions: [], // Defaulting to empty
    l1_fee: undefined, // Defaulting to null
    l1_fee_scalar: undefined, // Defaulting to null
    l1_gas_price: undefined, // Defaulting to null
    l1_gas_used: undefined, // Defaulting to null
    has_error_in_internal_txs: null, // Defaulting to null
    op_withdrawals: [], // Defaulting to empty
    wrapped: undefined, // Not mapped
    stability_fee: undefined, // Not mapped
    zkevm_verify_hash: undefined, // Not mapped
    zkevm_batch_number: undefined, // Not mapped
    zkevm_status: undefined, // Not mapped
    zkevm_sequence_hash: undefined, // Not mapped
    blob_versioned_hashes: undefined, // Not mapped
    blob_gas_used: undefined, // Not mapped
    blob_gas_price: undefined, // Not mapped
    burnt_blob_fee: undefined, // Not mapped
    max_fee_per_blob_gas: undefined, // Not mapped
    shard_id: undefined, // Not mapped
    inputs: undefined, // Not mapped
    outputs: undefined, // Not mapped
    is_etx: true, // Defaulting to false
    type: data.inbound?.type ?? null, // Defaulting to 0
    etx_type: etxType, // Not mapped
  };
}
