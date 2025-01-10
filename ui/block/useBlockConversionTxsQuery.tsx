import React from 'react';

import { normalizeOutboundInboundToTransaction } from '../../types/api/transaction';

import { retry } from 'lib/api/useQueryClientConfig';
import { OUTBOUND_INBOUND_TX } from 'stubs/tx';
import { generateListStub } from 'stubs/utils';
import useQueryWithPages from 'ui/shared/pagination/useQueryWithPages';
import type { QueryWithPagesResult } from 'ui/shared/pagination/useQueryWithPages';

export type OutboundConversionQuery = QueryWithPagesResult<'outbound_conversion_txs'>;

export function useNormalizedConversionTxsQuery(
  blockConversionTxsQuery: OutboundConversionQuery,
): QueryWithPagesResult<'block_txs'> {
  const normalizedData = React.useMemo(() => {
    if (!blockConversionTxsQuery.data) {
      return null;
    } // Explicitly return `null`

    const normalizedItems = blockConversionTxsQuery.data.items.map((item) =>
      normalizeOutboundInboundToTransaction(item, 'conversion'),
    );

    return {
      items: normalizedItems,
      next_page_params: blockConversionTxsQuery.data.next_page_params,
    };
  }, [ blockConversionTxsQuery.data ]);

  return {
    ...blockConversionTxsQuery,
    data: normalizedData, // Ensure `data` is either `null` or the normalized object
  } as QueryWithPagesResult<'block_txs'>;
}
export default function useBlockConversionTxsQuery({
  heightOrHash,
  tab,
}: {
  heightOrHash: string;
  tab: string;
}): OutboundConversionQuery {
  const [ isRefetchEnabled, setRefetchEnabled ] = React.useState(false);

  const apiQuery = useQueryWithPages<'outbound_conversion_txs'>({
    resourceName: 'outbound_conversion_txs',
    pathParams: { block_number: heightOrHash }, // Map `heightOrHash` to `block_number`
    filters: {}, // Add filters if needed, or leave empty
    options: {
      enabled: Boolean(tab === 'conversion'), // Only enable if the tab is 'conversion'
      placeholderData: generateListStub<'outbound_conversion_txs'>(
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
