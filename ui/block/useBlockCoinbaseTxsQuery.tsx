import React from 'react';

import { normalizeOutboundInboundToTransaction } from '../../types/api/transaction';

import { retry } from 'lib/api/useQueryClientConfig';
import { OUTBOUND_INBOUND_TX } from 'stubs/tx';
import { generateListStub } from 'stubs/utils';
import useQueryWithPages from 'ui/shared/pagination/useQueryWithPages';
import type { QueryWithPagesResult } from 'ui/shared/pagination/useQueryWithPages';

export type OutboundCoinbaseQuery = QueryWithPagesResult<'outbound_coinbase_txs'>;

export function useNormalizedCoinbaseTxsQuery(
  blockCoinbaseTxsQuery: OutboundCoinbaseQuery,
): QueryWithPagesResult<'block_txs'> {
  const normalizedData = React.useMemo(() => {
    if (!blockCoinbaseTxsQuery.data) {
      return null;
    }

    const normalizedItems = blockCoinbaseTxsQuery.data.items.map((item) =>
      normalizeOutboundInboundToTransaction(item, 'coinbase'),
    );

    return {
      items: normalizedItems,
      next_page_params: blockCoinbaseTxsQuery.data.next_page_params,
    };
  }, [ blockCoinbaseTxsQuery.data ]);

  return {
    ...blockCoinbaseTxsQuery,
    data: normalizedData,
  } as QueryWithPagesResult<'block_txs'>;
}
export default function useBlockCoinbaseTxsQuery({
  heightOrHash,
  tab,
}: {
  heightOrHash: string;
  tab: string;
}): OutboundCoinbaseQuery {
  const [ isRefetchEnabled, setRefetchEnabled ] = React.useState(false);

  const apiQuery = useQueryWithPages<'outbound_coinbase_txs'>({
    resourceName: 'outbound_coinbase_txs',
    pathParams: { block_number: heightOrHash }, // Map `heightOrHash` to `block_number`
    filters: {},
    options: {
      enabled: Boolean(tab === 'coinbase'),
      placeholderData: generateListStub<'outbound_coinbase_txs'>(
        OUTBOUND_INBOUND_TX,
        50,
        {
          next_page_params: {
            block_number: parseInt(heightOrHash),
            items_count: 50,
            index: 2,
          },
        },
      ),
      refetchOnMount: false,
      retry: (failureCount, error) => {
        if (isRefetchEnabled) {
          return false;
        }
        return retry(failureCount, error);
      },
      refetchInterval: () => (isRefetchEnabled ? 15 * 1000 : false),
    },
  });

  React.useEffect(() => {
    if (apiQuery.isPlaceholderData) {
      return;
    }

    if (apiQuery.isError && apiQuery.errorUpdateCount === 1) {
      setRefetchEnabled(true);
    } else if (!apiQuery.isError) {
      setRefetchEnabled(false);
    }
  }, [ apiQuery.errorUpdateCount, apiQuery.isError, apiQuery.isPlaceholderData ]);

  return { ...apiQuery };
}
