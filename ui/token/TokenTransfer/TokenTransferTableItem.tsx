import { Tr, Td, Flex, Skeleton, Box } from '@chakra-ui/react';
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

type Props = TokenTransfer & { tokenId?: string; isLoading?: boolean; tx_to?: any }

const TokenTransferTableItem = ({
  token,
  total,
  tx_hash: txHash,
  from,
  to,
  method,
  timestamp,
  tokenId,
  isLoading,
  tx_to,
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
    <Tr alignItems="top">
      <Td>
        <Flex alignItems="center" py="7px">
          <TxEntity
            hash={ txHash }
            isLoading={ isLoading }
            fontWeight={ 600 }
            noIcon
            truncation="constant_long"
          />
          { timestamp && (
            <Skeleton isLoaded={ !isLoading } display="inline-block" color="gray.500" fontWeight="400" ml="10px">
              <span>
                { timeAgo }
              </span>
            </Skeleton>
          ) }
        </Flex>
      </Td>
      <Td>
        { method ? (
          <Box my="3px">
            <Tag isLoading={ isLoading } isTruncated>{ decodedMethod.data?.name || method }</Tag>
          </Box>
        ) : null }
      </Td>
      <Td>
        <AddressFromTo
          from={ from }
          to={ to }
          isLoading={ isLoading }
          mt="5px"
          mode={{ lg: 'compact', xl: 'long' }}
          tokenHash={ token.address }
        />
      </Td>
      { (token.type === 'ERC-721' || token.type === 'ERC-1155') && (
        <Td>
          { 'token_id' in total && total.token_id !== null ? (
            <NftEntity
              hash={ token.address }
              id={ total.token_id }
              noLink={ Boolean(tokenId && tokenId === total.token_id) }
              isLoading={ isLoading }
            />
          ) : ''
          }
        </Td>
      ) }
      { (token.type === 'ERC-20' || token.type === 'ERC-1155') && (
        <Td isNumeric verticalAlign="top">
          { valueStr && (
            <Skeleton isLoaded={ !isLoading } display="inline-block" mt="7px" wordBreak="break-all">
              { valueStr }
            </Skeleton>
          ) }
          { usd && (
            <Skeleton isLoaded={ !isLoading } color="text_secondary" mt="10px" wordBreak="break-all">
              <span>${ usd }</span>
            </Skeleton>
          ) }
        </Td>
      ) }
    </Tr>
  );
};

export default React.memo(TokenTransferTableItem);
