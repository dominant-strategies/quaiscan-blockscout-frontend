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
    }

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
    data: normalizedData,
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
    pathParams: { block_number: heightOrHash },
    filters: {},
    options: {
      enabled: Boolean(tab === 'external'),
      placeholderData: generateListStub<'outbound_external_txs'>(
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
