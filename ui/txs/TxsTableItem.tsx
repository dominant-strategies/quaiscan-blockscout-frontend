import { Tr, Td, VStack, Skeleton } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import React from 'react';

import type { Transaction } from 'types/api/transaction';

import config from 'configs/app';
import { useDecodedMethod } from 'lib/hooks/useDecodedMethod';
import useTimeAgoIncrement from 'lib/hooks/useTimeAgoIncrement';
import { publicQuaisProvider } from 'lib/web3/client';
import AddressFromTo from 'ui/shared/address/AddressFromTo';
import Tag from 'ui/shared/chakra/Tag';
import CurrencyValue from 'ui/shared/CurrencyValue';
import BlockEntity from 'ui/shared/entities/block/BlockEntity';
import TxEntity from 'ui/shared/entities/tx/TxEntity';
import TxStatus from 'ui/shared/statusTag/TxStatus';
import TxFeeStability from 'ui/shared/tx/TxFeeStability';
import TxWatchListTags from 'ui/shared/tx/TxWatchListTags';
import TxAdditionalInfo from 'ui/txs/TxAdditionalInfo';

import TxType from './TxType';

type Props = {
  tx: Transaction;
  showBlockInfo: boolean;
  currentAddress?: string;
  enableTimeIncrement?: boolean;
  isLoading?: boolean;
};

const TxsTableItem = ({ tx, showBlockInfo, currentAddress, enableTimeIncrement, isLoading }: Props) => {
  const dataTo = tx.to ? tx.to : tx.created_contract;
  const currency = tx.tx_types?.includes('conversion') ? (dataTo?.currency || tx.from?.currency || '') : (tx.from?.currency || '');
  const timeAgo = useTimeAgoIncrement(tx.timestamp, enableTimeIncrement);
  const fee = tx.max_fee_per_gas && tx.gas_used ? (parseInt(tx.max_fee_per_gas)) * (parseInt(tx.gas_used)) : undefined;

  const decodedMethod = useDecodedMethod(
    {
      to: tx.to?.hash || null,
      data: tx.method || tx.raw_input || '0x',
    },
    publicQuaisProvider,
    {
      enabled: !tx.etx_type,
    },
  );

  return (
    <Tr
      as={ motion.tr }
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transitionDuration="normal"
      transitionTimingFunction="linear"
      key={ tx.hash }
    >
      <Td pl={ 4 }>
        <TxAdditionalInfo tx={ tx } isLoading={ isLoading }/>
      </Td>
      <Td pr={ 4 }>
        <VStack alignItems="start" lineHeight="24px">
          <TxEntity
            hash={ tx.hash }
            isLoading={ isLoading }
            fontWeight={ 700 }
            noIcon
            maxW="100%"
            truncation="constant_long"
          />
          { tx.timestamp && (
            <Skeleton color="text_secondary" fontWeight="400" isLoaded={ !isLoading }>
              <span>{ timeAgo }</span>
            </Skeleton>
          ) }
        </VStack>
      </Td>
      <Td>
        <VStack alignItems="start">
          <TxType tx={ tx } isLoading={ isLoading }/>
          <TxStatus
            status={ tx.is_etx ? tx.result : tx.status }
            errorText={ tx.status === 'error' ? tx.result : undefined }
            isLoading={ isLoading }
          />
          <TxWatchListTags tx={ tx } isLoading={ isLoading }/>
        </VStack>
      </Td>
      <Td whiteSpace="nowrap">
        { (tx.method || decodedMethod.data?.name) && (
          <Tag colorScheme={ tx.method === 'Multicall' ? 'teal' : 'gray' } isLoading={ isLoading } isTruncated>
            { decodedMethod.data?.name || tx.method || tx.raw_input.slice(0, 10) + '...' }
          </Tag>
        ) }
      </Td>
      { showBlockInfo && (
        <Td>
          { tx.block && (
            <BlockEntity isLoading={ isLoading } number={ tx.block } noIcon fontSize="sm" lineHeight={ 6 } fontWeight={ 500 }/>
          ) }
        </Td>
      ) }
      <Td>
        <AddressFromTo
          from={ tx.from }
          to={ dataTo }
          current={ currentAddress }
          isLoading={ isLoading }
          mt="2px"
          mode="compact"
        />
      </Td>
      { !config.UI.views.tx.hiddenFields?.value && (
        <Td isNumeric>
          <CurrencyValue value={ tx.value } currency={ currency } accuracy={ 3 } isLoading={ isLoading }/>
        </Td>
      ) }
      { !config.UI.views.tx.hiddenFields?.tx_fee && (
        <Td isNumeric>
          { /* eslint-disable-next-line no-nested-ternary */ }
          { tx.stability_fee ? (
            <TxFeeStability data={ tx.stability_fee } isLoading={ isLoading } accuracy={ 8 } justifyContent="end" hideUsd/>
          ) : fee ? (
            <CurrencyValue value={ fee.toString() } currency={ currency } accuracy={ 8 } isLoading={ isLoading }/>
          ) : (
            '-'
          ) }
        </Td>
      ) }
    </Tr>
  );
};

export default React.memo(TxsTableItem);
