import { useRouter } from 'next/router';
import React from 'react';

import { useContractAbis } from 'lib/hooks/useDecodedMethod';
import getQueryParamString from 'lib/router/getQueryParamString';
import { publicQuaisProvider } from 'lib/web3/client';
import { LOG } from 'stubs/log';
import { generateListStub } from 'stubs/utils';
import ActionBar from 'ui/shared/ActionBar';
import DataListDisplay from 'ui/shared/DataListDisplay';
import LogItem from 'ui/shared/logs/LogItem';
import Pagination from 'ui/shared/pagination/Pagination';
import useQueryWithPages from 'ui/shared/pagination/useQueryWithPages';

import AddressCsvExportLink from './AddressCsvExportLink';

const AddressLogs = ({ scrollRef }: {scrollRef?: React.RefObject<HTMLDivElement>}) => {
  const router = useRouter();

  const hash = getQueryParamString(router.query.hash);
  const { data, isPlaceholderData, isError, pagination } = useQueryWithPages({
    resourceName: 'address_logs',
    pathParams: { hash },
    scrollRef,
    options: {
      placeholderData: generateListStub<'address_logs'>(LOG, 3, { next_page_params: {
        block_number: 9005750,
        index: 42,
        items_count: 50,
        transaction_index: 23,
      } }),
    },
  });

  // Get unique contract addresses from logs
  const uniqueAddresses = React.useMemo(() => {
    if (!data?.items) {
      return [];
    }
    return Array.from(new Set(data.items.map(item => item.address.hash)));
  }, [ data?.items ]);

  // Get ABIs for all unique addresses
  const abiMap = useContractAbis(uniqueAddresses, publicQuaisProvider);

  const actionBar = (
    <ActionBar mt={ -6 } showShadow justifyContent={{ base: 'space-between', lg: 'end' }}>
      <AddressCsvExportLink
        address={ hash }
        isLoading={ pagination.isLoading }
        params={{ type: 'logs' }}
      />
      <Pagination ml={{ base: 0, lg: 8 }} { ...pagination }/>
    </ActionBar>
  );

  const content = data?.items ? data.items.map((item, index) => (
    <LogItem
      key={ index }
      { ...item }
      type="address"
      isLoading={ isPlaceholderData }
      abi={ abiMap.get(item.address.hash) || undefined }
    />
  )) : null;

  return (
    <DataListDisplay
      isError={ isError }
      items={ data?.items }
      emptyText="There are no logs for this address."
      content={ content }
      actionBar={ actionBar }
    />
  );
};

export default AddressLogs;
