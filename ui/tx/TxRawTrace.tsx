import { useRouter } from 'next/router';
import React from 'react';

import { useTxRawTrace } from 'lib/hooks/useTxTrace';
import getQueryParamString from 'lib/router/getQueryParamString';
import DataFetchAlert from 'ui/shared/DataFetchAlert';
import RawDataSnippet from 'ui/shared/RawDataSnippet';
import TxPendingAlert from 'ui/tx/TxPendingAlert';
import TxSocketAlert from 'ui/tx/TxSocketAlert';

import type { TxQuery } from './useTxQuery';

interface Props {
  txQuery: TxQuery;
}

const TxRawTrace = ({ txQuery }: Props) => {
  const router = useRouter();
  const hash = getQueryParamString(router.query.hash);

  const { data: rawTrace, isError: isTraceError } = useTxRawTrace(txQuery.data && txQuery.data.hash !== '0x' ? hash : undefined);

  if (!txQuery.isPending && !txQuery.isPlaceholderData && !txQuery.isError && !txQuery.data.status) {
    return txQuery.socketStatus ? <TxSocketAlert status={ txQuery.socketStatus }/> : <TxPendingAlert/>;
  }

  if (isTraceError || txQuery.isError) {
    return <DataFetchAlert/>;
  }

  if (!rawTrace) {
    return <span>No trace entries found.</span>;
  }

  const text = JSON.stringify(rawTrace, undefined, 4);

  return <RawDataSnippet data={ text } isLoading={ false }/>;
};

export default TxRawTrace;
