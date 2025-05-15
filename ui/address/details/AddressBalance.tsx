import { useQueryClient } from '@tanstack/react-query';
import React from 'react';

import type { SocketMessage } from 'lib/socket/types';
import type { Address } from 'types/api/address';

import config from 'configs/app';
import { getResourceKey } from 'lib/api/useApiQuery';
import { useQuaiPrice } from 'lib/hooks/useQuaiPrice';
import useSocketChannel from 'lib/socket/useSocketChannel';
import useSocketMessage from 'lib/socket/useSocketMessage';
import CurrencyValue from 'ui/shared/CurrencyValue';
import DetailsInfoItem from 'ui/shared/DetailsInfoItem';

interface Props {
  data: Pick<Address, 'block_number_balance_updated_at' | 'coin_balance' | 'hash' | 'exchange_rate' | 'currency'>;
  isLoading: boolean;
}

const AddressBalance = ({ data, isLoading }: Props) => {
  const [ lastBlockNumber, setLastBlockNumber ] = React.useState<number>(data.block_number_balance_updated_at || 0);
  const queryClient = useQueryClient();

  // Get start of current hour in UTC
  const now = new Date();
  const startOfHour = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours()));
  const quaiPrice = useQuaiPrice(data.coin_balance && data.coin_balance !== '0' ? startOfHour.toISOString() : null);

  const updateData = React.useCallback(
    (balance: string, exchangeRate: string, blockNumber: number) => {
      if (blockNumber < lastBlockNumber) {
        return;
      }

      setLastBlockNumber(blockNumber);
      const queryKey = getResourceKey('address', { pathParams: { hash: data.hash } });
      queryClient.setQueryData(queryKey, (prevData: Address | undefined) => {
        if (!prevData) {
          return;
        }
        return {
          ...prevData,
          coin_balance: balance,
          exchange_rate: exchangeRate,
          block_number_balance_updated_at: blockNumber,
        };
      });
    },
    [ data.hash, lastBlockNumber, queryClient ],
  );

  const handleNewBalanceMessage: SocketMessage.AddressBalance['handler'] = React.useCallback(
    (payload) => {
      updateData(payload.balance, payload.exchange_rate, payload.block_number);
    },
    [ updateData ],
  );

  const handleNewCoinBalanceMessage: SocketMessage.AddressCurrentCoinBalance['handler'] = React.useCallback(
    (payload) => {
      updateData(payload.coin_balance, payload.exchange_rate, payload.block_number);
    },
    [ updateData ],
  );

  const channel = useSocketChannel({
    topic: `addresses:${ data.hash.toLowerCase() }`,
    isDisabled: !data.coin_balance,
  });
  useSocketMessage({
    channel,
    event: 'balance',
    handler: handleNewBalanceMessage,
  });
  useSocketMessage({
    channel,
    event: 'current_coin_balance',
    handler: handleNewCoinBalanceMessage,
  });

  return (
    <DetailsInfoItem
      title="Balance"
      hint={ `Address balance. Doesn't include ERC20, ERC721 and ERC1155 tokens` }
      flexWrap="nowrap"
      alignItems="flex-start"
      isLoading={ isLoading }
    >
      <CurrencyValue
        value={ data.coin_balance || '0' }
        exchangeRate={ quaiPrice.data }
        decimals={ String(config.chain.currency.decimals) }
        currency={ data.currency }
        accuracyUsd={ 2 }
        accuracy={ 0 }
        flexWrap="wrap"
        isLoading={ isLoading }
      />
    </DetailsInfoItem>
  );
};

export default React.memo(AddressBalance);
