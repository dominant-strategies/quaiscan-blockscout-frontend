import { Grid, Flex, Skeleton } from '@chakra-ui/react';
import React from 'react';

import type { TokenTransfer } from 'types/api/tokenTransfer';

import getCurrencyValue from 'lib/getCurrencyValue';
import { useDecodedMethod } from 'lib/hooks/useDecodedMethod';
import useTimeAgoIncrement from 'lib/hooks/useTimeAgoIncrement';
import { publicQuaisProvider } from 'lib/web3/client';
import AddressFromTo from 'ui/shared/address/AddressFromTo';
import Tag from 'ui/shared/chakra/Tag';
import NftEntity from 'ui/shared/entities/nft/NftEntity';
import TxEntity from 'ui/shared/entities/tx/TxEntity';
import ListItemMobile from 'ui/shared/ListItemMobile/ListItemMobile';
import TruncatedValue from 'ui/shared/TruncatedValue';

type Props = TokenTransfer & { tokenId?: string; isLoading?: boolean; tx_to?: any };

const TokenTransferListItem = ({
  token,
  total,
  tx_hash: txHash,
  from,
  to,
  tx_to,
  method,
  timestamp,
  tokenId,
  isLoading,
}: Props) => {
  const timeAgo = useTimeAgoIncrement(timestamp, true);
  const { usd, valueStr } = 'value' in total ? getCurrencyValue({
    value: total.value,
    exchangeRate: token.exchange_rate,
    accuracy: 8,
    accuracyUsd: 2,
    decimals: total.decimals || '0',
  }) : { usd: null, valueStr: null };

  const decodedMethod = useDecodedMethod({
    to: tx_to?.hash || null,
    data: method || '0x',
  }, publicQuaisProvider);

  return (
    <ListItemMobile rowGap={ 3 } isAnimated>
      <Flex justifyContent="space-between" alignItems="center" lineHeight="24px" width="100%">
        <TxEntity
          isLoading={ isLoading }
          hash={ txHash }
          truncation="constant_long"
          fontWeight="700"
        />
        { timestamp && (
          <Skeleton isLoaded={ !isLoading } display="inline-block" fontWeight="400" fontSize="sm" color="text_secondary">
            <span>
              { timeAgo }
            </span>
          </Skeleton>
        ) }
      </Flex>
      { method && (
        <Tag isLoading={ isLoading }>
          { decodedMethod.data?.name || method }
        </Tag>
      ) }
      <AddressFromTo
        from={ from }
        to={ to }
        isLoading={ isLoading }
        tokenHash={ token.address }
        w="100%"
        fontWeight="500"
      />
      { valueStr && (token.type === 'ERC-20' || token.type === 'ERC-1155') && (
        <Grid gap={ 2 } templateColumns={ `1fr auto auto${ usd ? ' auto' : '' }` }>
          <Skeleton isLoaded={ !isLoading } flexShrink={ 0 } fontWeight={ 500 }>
            Value
          </Skeleton>
          <Skeleton
            isLoaded={ !isLoading }
            color="text_secondary"
            wordBreak="break-all"
            overflow="hidden"
            flexGrow={ 1 }
          >
            <span>{ valueStr }</span>
          </Skeleton>
          { token.symbol && <TruncatedValue isLoading={ isLoading } value={ token.symbol }/> }
          { usd && (
            <Skeleton
              isLoaded={ !isLoading }
              color="text_secondary"
              wordBreak="break-all"
              overflow="hidden"
            >
              <span>(${ usd })</span>
            </Skeleton>
          ) }
        </Grid>
      ) }
      { 'token_id' in total && (token.type === 'ERC-721' || token.type === 'ERC-1155') && total.token_id !== null && (
        <NftEntity
          hash={ token.address }
          id={ total.token_id }
          noLink={ Boolean(tokenId && tokenId === total.token_id) }
          isLoading={ isLoading }
        />
      ) }
    </ListItemMobile>
  );
};

export default React.memo(TokenTransferListItem);
