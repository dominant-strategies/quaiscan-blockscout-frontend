// import { useQuery } from '@tanstack/react-query';
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
    } // Explicitly return `null`

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
    data: normalizedData, // Ensure `data` is either `null` or the normalized object
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
    filters: {}, // Add filters if needed, or leave empty
    options: {
      enabled: Boolean(tab === 'coinbase'), // Only enable if the tab is 'coinbase'
      placeholderData: generateListStub<'outbound_coinbase_txs'>(
        OUTBOUND_INBOUND_TX, // Use the pre-defined OUTBOUND_INBOUND_TX object as the stub
        50, // Number of items to generate
        {
          next_page_params: {
            block_number: parseInt(heightOrHash), // Dynamic value for the block number
            items_count: 50, // Number of items per page
            index: 2, // Placeholder for the next page index
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

  // Enable refetch if the query fails
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
