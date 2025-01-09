import type { RawTracesResponse } from 'types/api/rawTrace';
import type { OutboundInbound, Transaction, UtxoTransaction } from 'types/api/transaction';

import { ADDRESS_PARAMS } from './addressParams';

export const TX_HASH = '0x3ed9d81e7c1001bdda1caa1dc62c0acbbe3d2c671cdc20dc1e65efdaa4186967';

export const TX: Transaction = {
  timestamp: '2022-11-11T11:11:11.000000Z',
  fee: {
    type: 'actual',
    value: '2100000000000000',
  },
  gas_limit: '21000',
  block: 9004925,
  status: 'ok',
  method: 'placeholder',
  confirmations: 71,
  type: 0,
  exchange_rate: '1828.71',
  to: ADDRESS_PARAMS,
  tx_burnt_fee: null,
  max_fee_per_gas: null,
  result: 'success',
  hash: '0x2b824349b320cfa72f292ab26bf525adb00083ba9fa097141896c3c8c74567cc',
  gas_price: '100000000000',
  priority_fee: null,
  base_fee_per_gas: '24',
  from: ADDRESS_PARAMS,
  token_transfers: null,
  tx_types: [
    'coin_transfer',
  ],
  gas_used: '21000',
  created_contract: null,
  position: 0,
  nonce: 295929,
  has_error_in_internal_txs: false,
  actions: [],
  decoded_input: null,
  token_transfers_overflow: false,
  raw_input: '0x',
  value: '42000420000000000000',
  max_priority_fee_per_gas: null,
  revert_reason: null,
  confirmation_duration: [
    0,
    14545,
  ],
  tx_tag: null,
};

export const OUTBOUND_INBOUND_TX: OutboundInbound = {
  inbound: {
    block_hash: '00004f9ec3751727fa1179aa5a791741db25c3e21abdba54ab588a6237803188',
    block_timestamp: null,
    chain_id: null,
    cumulative_gas_used: '0',
    from_address: '00ab6272b231776f5e753086be2068499729981f',
    gas: '21000',
    gas_price: '0',
    gas_used: '0',
    hash: '00f800ff2322dd592846ea91f4a5529aad136790c019a27b50e0d54c92da65ab',
    index: 0,
    max_fee_per_gas: null,
    max_priority_fee_per_gas: null,
    nonce: 0,
    status: 'ok',
    to_address: '00ab6272b231776f5e753086be2068499729981f',
    type: 1,
    value: '1',
  },
  outbound: {
    from_address: '00ab6272b231776f5e753086be2068499729981f',
    gas: '21000',
    hash: '00f800ff2322dd592846ea91f4a5529aad136790c019a27b50e0d54c92da65ab',
    to_address: '00ab6272b231776f5e753086be2068499729981f',
    transaction_index: 0,
    value: '1',
  },
};

export const UTXO_TX: UtxoTransaction = {
  block_hash: '0x5621d9f0f18f0bcfad20ce6be0fa820cddd3bf5d1c4fe4f924b34f1dbca88eea',
  block_number: 3667,
  gas: '0',
  hash: '0x00c600fa149150e51b1e5d1774a5327e7671a3f0d19f3e28c5211be4773b8d26',
  index: 0,
  input: '0x',
  inputs: [
    { PreviousOutPoint: { Index: 65535, TxHash: '0x0000c00c7a78992d4d072f77be40540bd0f860513c18324a5bbe998b43b1aad8' },
      PubKey: 'BGg++w6KzDmQKENr61SavMrihpaxLk4s6DjobCO9+98/YIWKefH1PVTiAUVfaiT57YsU0RivOCfXdUKLtlkIuVk=' },
  ],
  nonce: 0,
  outputs: [
    { Address: 'AKPkWqFhY/JmMBW2aViU2RiGbRk=', Denomination: 7, Lock: 0 },
  ],
  type: 2,
  utxoSignature: '0x20ad6123dbb8b8c96f04659933be4a36b162f8e47d630ee293095edb2e4ad2d8983cb41b7756f579ef162633d7efb4c7bfff11f51d3aaa31d25fafbf12fa86de',
};

export const TX_ZKEVM_L2: Transaction = {
  ...TX,
  zkevm_batch_number: 12345,
  zkevm_sequence_hash: '0x2b824349b320cfa72f292ab26bf525adb00083ba9fa097141896c3c8c74567cc',
  zkevm_status: 'Confirmed by Sequencer',
  zkevm_verify_hash: '0x2b824349b320cfa72f292ab26bf525adb00083ba9fa097141896c3c8c74567cc',
};

export const TX_RAW_TRACE: RawTracesResponse = [];
