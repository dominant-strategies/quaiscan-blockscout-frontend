import { Accordion, Hide, Show, Text } from '@chakra-ui/react';
import React from 'react';

import { TX_STATE_CHANGES } from 'stubs/txStateChanges';
import ActionBar from 'ui/shared/ActionBar';
import DataListDisplay from 'ui/shared/DataListDisplay';
import Pagination from 'ui/shared/pagination/Pagination';
import useQueryWithPages from 'ui/shared/pagination/useQueryWithPages';
import TxStateList from 'ui/tx/state/TxStateList';
import TxStateTable from 'ui/tx/state/TxStateTable';

import TxPendingAlert from './TxPendingAlert';
import TxSocketAlert from './TxSocketAlert';
import type { TxQuery } from './useTxQuery';

interface Props {
  txQuery: TxQuery;
}

const TxState = ({ txQuery }: Props) => {
  const { data, isPlaceholderData, isError, pagination } = useQueryWithPages({
    resourceName: 'tx_state_changes',
    pathParams: { hash: txQuery.data?.hash },
    options: {
      enabled: !txQuery.isPlaceholderData && Boolean(txQuery.data?.hash) && Boolean(txQuery.data?.status),
      placeholderData: {
        items: TX_STATE_CHANGES,
        next_page_params: {
          items_count: 1,
          state_changes: null,
        },
      },
    },
  });

  if (!txQuery.isPending && !txQuery.isPlaceholderData && !txQuery.isError && !txQuery.data.status) {
    return txQuery.socketStatus ? <TxSocketAlert status={ txQuery.socketStatus }/> : <TxPendingAlert/>;
  }

  const filteredItems = React.useMemo(() => {
    if (!data?.items || !txQuery.data) {
      return data?.items;
    }

    const isConversion = txQuery.data.tx_types?.includes('conversion');
    const targetCurrency = isConversion ? txQuery.data.to?.currency : txQuery.data.from?.currency;

    if (!targetCurrency) {
      return data.items;
    }

    return data.items.filter(item => item.address.currency === targetCurrency);
  }, [ data?.items, txQuery.data ]);

  const content = filteredItems ? (
    <Accordion allowMultiple defaultIndex={ [] }>
      <Hide below="lg" ssr={ false }>
        <TxStateTable data={ filteredItems } isLoading={ isPlaceholderData } top={ pagination.isVisible ? 80 : 0 }/>
      </Hide>
      <Show below="lg" ssr={ false }>
        <TxStateList data={ filteredItems } isLoading={ isPlaceholderData }/>
      </Show>
    </Accordion>
  ) : null;

  const actionBar = pagination.isVisible ? (
    <ActionBar mt={ -6 } showShadow>
      <Pagination ml="auto" { ...pagination }/>
    </ActionBar>
  ) : null;

  return (
    <>
      { !isError && !txQuery.isError && (
        <Text mb={ 6 }>
          A set of information that represents the current state is updated when a transaction takes place on the network.
          The below is a summary of those changes.
        </Text>
      ) }
      <DataListDisplay
        isError={ isError || txQuery.isError }
        items={ filteredItems }
        emptyText="There are no state changes for this transaction."
        content={ content }
        actionBar={ actionBar }
      />
    </>
  );
};

export default TxState;
