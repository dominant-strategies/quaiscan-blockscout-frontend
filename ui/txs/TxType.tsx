import { isQiAddress, isQuaiAddress } from 'quais';
import React from 'react';

import type { ExternalTransaction, Transaction, TransactionType } from 'types/api/transaction';

import Tag from 'ui/shared/chakra/Tag';

export interface Props {
  tx: Transaction | ExternalTransaction;
  isLoading?: boolean;
}

const TYPES_ORDER: Array<TransactionType> = [
  'utxo_transaction',
  'blob_transaction',
  'rootstock_remasc',
  'rootstock_bridge',
  'token_creation',
  'contract_creation',
  'token_transfer',
  'coinbase',
  'conversion',
  'external',
  'contract_call',
  'coin_transfer',
];

export const isConversionRevert = (tx: Transaction | ExternalTransaction) => {
  const types = tx.tx_types;
  const typeToShow = types.sort((t1, t2) => TYPES_ORDER.indexOf(t1) - TYPES_ORDER.indexOf(t2))[0];
  return tx.to?.hash && tx.from?.hash && isQiAddress(tx.to?.hash) && isQuaiAddress(tx.from?.hash) && (typeToShow === null || typeToShow === undefined);
};

const TxType = ({ tx, isLoading }: Props) => {
  const types = tx.tx_types;
  const typeToShow = types.sort((t1, t2) => TYPES_ORDER.indexOf(t1) - TYPES_ORDER.indexOf(t2))[0];
  let label;
  let colorScheme;

  switch (typeToShow) {
    case 'contract_call':
      label = 'Contract call';
      colorScheme = 'blue';
      break;
    case 'blob_transaction':
      label = 'Blob txn';
      colorScheme = 'yellow';
      break;
    case 'contract_creation':
      label = 'Contract creation';
      colorScheme = 'blue';
      break;
    case 'token_transfer':
      label = 'Token transfer';
      colorScheme = 'orange';
      break;
    case 'token_creation':
      label = 'Token creation';
      colorScheme = 'orange';
      break;
    case 'coin_transfer':
      label = 'Coin transfer';
      colorScheme = 'orange';
      break;
    case 'rootstock_remasc':
      label = 'REMASC';
      colorScheme = 'blue';
      break;
    case 'rootstock_bridge':
      label = 'Bridge';
      colorScheme = 'blue';
      break;
    case 'utxo_transaction':
      label = 'UTXO transaction';
      colorScheme = 'red';
      break;
    case 'coinbase':
      label = 'Coinbase';
      colorScheme = 'gray';
      break;
    case 'conversion':
      label = 'Conversion transaction';
      colorScheme = 'gray';
      break;
    case 'external':
      label = 'External transaction';
      colorScheme = 'gray';
      break;
    default:
      label = 'Transaction';
      colorScheme = 'purple';
  }

  if (isConversionRevert(tx)) {
    label = 'Conversion revert';
    colorScheme = 'red';
  }

  return (
    <Tag maxWidth="250" colorScheme={ colorScheme } isLoading={ isLoading }>
      { label }
    </Tag>
  );
};

export default TxType;
