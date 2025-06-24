import {
  HStack,
  Flex,
  Skeleton,
} from '@chakra-ui/react';
import React from 'react';

import type { ExternalTransaction } from 'types/api/transaction';

import config from 'configs/app';
import getValueWithUnit from 'lib/getValueWithUnit';
import useTimeAgoIncrement from 'lib/hooks/useTimeAgoIncrement';
import { space } from 'lib/html-entities';
import { currencyUnits } from 'lib/units';
import AddressFromTo from 'ui/shared/address/AddressFromTo';
import BlockEntity from 'ui/shared/entities/block/BlockEntity';
import TxEntity from 'ui/shared/entities/tx/TxEntity';
import ListItemMobile from 'ui/shared/ListItemMobile/ListItemMobile';
import TxStatus from 'ui/shared/statusTag/TxStatus';
import TxAdditionalInfo from 'ui/txs/TxAdditionalInfo';
import TxType from 'ui/txs/TxType';

type Props = {
  tx: ExternalTransaction;
  showBlockInfo: boolean;
  currentAddress?: string;
  enableTimeIncrement?: boolean;
  isLoading?: boolean;
}

const ExtTxsListItem = ({ tx, isLoading, showBlockInfo, currentAddress, enableTimeIncrement }: Props) => {
  const dataTo = tx.to ? tx.to : tx.created_contract;

  const timeAgo = useTimeAgoIncrement(tx.timestamp, enableTimeIncrement);

  return (
    <ListItemMobile display="block" width="100%" isAnimated key={ tx.hash }>
      <Flex justifyContent="space-between" mt={ 4 }>
        <HStack flexWrap="wrap">
          <TxType tx={ tx } isLoading={ isLoading }/>
          <TxStatus status={ tx.status } errorText={ tx.status === 'error' ? tx.result : undefined } isLoading={ isLoading }/>
        </HStack>
        <TxAdditionalInfo tx={ tx } isMobile isLoading={ isLoading }/>
      </Flex>
      <Flex justifyContent="space-between" lineHeight="24px" mt={ 3 } alignItems="center">
        <TxEntity
          isLoading={ isLoading }
          hash={ tx.hash }
          truncation="constant_long"
          fontWeight="700"
        />
        { tx.timestamp && (
          <Skeleton isLoaded={ !isLoading } color="text_secondary" fontWeight="400" fontSize="sm">
            <span>{ timeAgo }</span>
          </Skeleton>
        ) }
      </Flex>
      { tx.method && (
        <Flex mt={ 3 }>
          <Skeleton isLoaded={ !isLoading } display="inline-block" whiteSpace="pre">Method </Skeleton>
          <Skeleton
            isLoaded={ !isLoading }
            color="text_secondary"
            overflow="hidden"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
          >
            <span>{ tx.method }</span>
          </Skeleton>
        </Flex>
      ) }
      { showBlockInfo && tx.block !== null && (
        <Flex mt={ 2 }>
          <Skeleton isLoaded={ !isLoading } display="inline-block" whiteSpace="pre">Block </Skeleton>
          <BlockEntity
            isLoading={ isLoading }
            number={ tx.block }
            noIcon
          />
        </Flex>
      ) }
      <AddressFromTo
        from={ tx.from }
        to={ dataTo }
        current={ currentAddress }
        isLoading={ isLoading }
        mt={ 6 }
        fontWeight="500"
      />
      { !config.UI.views.tx.hiddenFields?.value && (
        <Flex mt={ 2 } columnGap={ 2 }>
          <Skeleton isLoaded={ !isLoading } display="inline-block" whiteSpace="pre">Value</Skeleton>
          <Skeleton isLoaded={ !isLoading } display="inline-block" variant="text_secondary" whiteSpace="pre">
            { getValueWithUnit(tx.value).toFormat() }
            { space }
            { currencyUnits.ether }
          </Skeleton>
        </Flex>
      ) }
    </ListItemMobile>
  );
};

export default React.memo(ExtTxsListItem);
