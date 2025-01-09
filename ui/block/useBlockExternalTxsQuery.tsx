import React from 'react';

import { normalizeOutboundInboundToTransaction } from '../../types/api/transaction';

import { retry } from 'lib/api/useQueryClientConfig';
import { OUTBOUND_INBOUND_TX } from 'stubs/tx';
import { generateListStub } from 'stubs/utils';
import useQueryWithPages from 'ui/shared/pagination/useQueryWithPages';
import type { QueryWithPagesResult } from 'ui/shared/pagination/useQueryWithPages';

export type OutboundExternalQuery = QueryWithPagesResult<'outbound_external_txs'>;

export function useNormalizedExternalTxsQuery(
  blockExternalTxsQuery: OutboundExternalQuery,
): QueryWithPagesResult<'block_txs'> {
  const normalizedData = React.useMemo(() => {
    if (!blockExternalTxsQuery.data) {
      return null;
    } // Explicitly return `null`

    const normalizedItems = blockExternalTxsQuery.data.items.map((item) =>
      normalizeOutboundInboundToTransaction(item, 'external'),
    );

    return {
      items: normalizedItems,
      next_page_params: blockExternalTxsQuery.data.next_page_params,
    };
  }, [ blockExternalTxsQuery.data ]);

  return {
    ...blockExternalTxsQuery,
    data: normalizedData, // Ensure `data` is either `null` or the normalized object
  } as QueryWithPagesResult<'block_txs'>;
}
export default function useBlockExternalTxsQuery({
  heightOrHash,
  tab,
}: {
  heightOrHash: string;
  tab: string;
}): OutboundExternalQuery {
  const [ isRefetchEnabled, setRefetchEnabled ] = React.useState(false);

  const apiQuery = useQueryWithPages<'outbound_external_txs'>({
    resourceName: 'outbound_external_txs',
    pathParams: { block_number: heightOrHash }, // Map `heightOrHash` to `block_number`
    filters: {}, // Add filters if needed, or leave empty
    options: {
      enabled: Boolean(tab === 'external'), // Only enable if the tab is 'external'
      placeholderData: generateListStub<'outbound_external_txs'>(
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
