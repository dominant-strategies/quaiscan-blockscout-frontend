import { chakra, Skeleton } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';

import type { PaginationParams } from 'ui/shared/pagination/types';
import type { RoutedTab } from 'ui/shared/Tabs/types';

import config from 'configs/app';
import { useAppContext } from 'lib/contexts/app';
import throwOnAbsentParamError from 'lib/errors/throwOnAbsentParamError';
import throwOnResourceLoadError from 'lib/errors/throwOnResourceLoadError';
import useIsMobile from 'lib/hooks/useIsMobile';
import getQueryParamString from 'lib/router/getQueryParamString';
import BlockDetails from 'ui/block/BlockDetails';
import BlockWithdrawals from 'ui/block/BlockWithdrawals';
import useBlockBlobTxsQuery from 'ui/block/useBlockBlobTxsQuery';
import useBlockCoinbaseTxsQuery, { useNormalizedCoinbaseTxsQuery } from 'ui/block/useBlockCoinbaseTxsQuery';
import useBlockConversionTxsQuery from 'ui/block/useBlockConversionTxsQuery';
import useBlockExternalTxsQuery from 'ui/block/useBlockExternalTxsQuery';
import useBlockQuery from 'ui/block/useBlockQuery';
import useBlockTxsQuery from 'ui/block/useBlockTxsQuery';
import useBlockWithdrawalsQuery from 'ui/block/useBlockWithdrawalsQuery';
import TextAd from 'ui/shared/ad/TextAd';
import ServiceDegradationWarning from 'ui/shared/alerts/ServiceDegradationWarning';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import NetworkExplorers from 'ui/shared/NetworkExplorers';
import PageTitle from 'ui/shared/Page/PageTitle';
import Pagination from 'ui/shared/pagination/Pagination';
import RoutedTabs from 'ui/shared/Tabs/RoutedTabs';
import TabsSkeleton from 'ui/shared/Tabs/TabsSkeleton';
import TxsWithFrontendSorting from 'ui/txs/TxsWithFrontendSorting';

const TAB_LIST_PROPS = {
  marginBottom: 0,
  py: 5,
  marginTop: -5,
};

const BlockPageContent = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const appProps = useAppContext();
  const heightOrHash = getQueryParamString(router.query.height_or_hash);
  const tab = getQueryParamString(router.query.tab);

  const blockQuery = useBlockQuery({ heightOrHash });
  const blockTxsQuery = useBlockTxsQuery({ heightOrHash, blockQuery, tab });
  const blockCoinbaseTxsQuery = useBlockCoinbaseTxsQuery({ heightOrHash, tab });
  const blockExternalTxsQuery = useBlockExternalTxsQuery({ heightOrHash, tab });
  const blockConversionTxsQuery = useBlockConversionTxsQuery({ heightOrHash, tab });
  const blockWithdrawalsQuery = useBlockWithdrawalsQuery({ heightOrHash, blockQuery, tab });
  const blockBlobTxsQuery = useBlockBlobTxsQuery({ heightOrHash, blockQuery, tab });
  const normalizedCoinbaseTxsQuery = useNormalizedCoinbaseTxsQuery(blockCoinbaseTxsQuery);
  const normalizedConversionTxsQuery = useNormalizedCoinbaseTxsQuery(blockConversionTxsQuery);
  const normalizedExternalTxsQuery = useNormalizedCoinbaseTxsQuery(blockExternalTxsQuery);

  const tabs: Array<RoutedTab> = React.useMemo(
    () =>
      [
        {
          id: 'index',
          title: 'Details',
          component: (
            <>
              { blockQuery.isDegradedData && (
                <ServiceDegradationWarning isLoading={ blockQuery.isPlaceholderData } mb={ 6 }/>
              ) }
              <BlockDetails query={ blockQuery }/>
            </>
          ),
        },
        {
          id: 'txs',
          title: 'Transactions',
          component: (
            <>
              { blockTxsQuery.isDegradedData && (
                <ServiceDegradationWarning isLoading={ blockTxsQuery.isPlaceholderData } mb={ 6 }/>
              ) }
              <TxsWithFrontendSorting query={ blockTxsQuery } showBlockInfo={ false } showSocketInfo={ false }/>
            </>
          ),
        },
        {
          id: 'coinbase',
          title: 'Coinbases',
          component: (
            <TxsWithFrontendSorting
              query={ normalizedCoinbaseTxsQuery }
              showBlockInfo={ false }
              showSocketInfo={ false }
            />
          ),
        },
        {
          id: 'external',
          title: 'Externals',
          component: (
            <TxsWithFrontendSorting
              query={ normalizedExternalTxsQuery }
              showBlockInfo={ false }
              showSocketInfo={ false }
            />
          ),
        },
        {
          id: 'conversion',
          title: 'Conversions',
          component: (
            <TxsWithFrontendSorting
              query={ normalizedConversionTxsQuery }
              showBlockInfo={ false }
              showSocketInfo={ false }
            />
          ),
        },
        blockQuery.data?.blob_tx_count ?
          {
            id: 'blob_txs',
            title: 'Blob txns',
            component: (
              <TxsWithFrontendSorting query={ blockBlobTxsQuery } showBlockInfo={ false } showSocketInfo={ false }/>
            ),
          } :
          null,
        // {
        //   id: 'uncles',
        //   title: 'Uncles',
        //   component: (
        //     <>
        //       { blockTxsQuery.isDegradedData && (
        //         <ServiceDegradationWarning isLoading={ blockTxsQuery.isPlaceholderData } mb={ 6 }/>
        //       ) }
        //       <ExtTxsWithFrontendSorting query={ blockExtTxsQuery } showBlockInfo={ false } showSocketInfo={ false }/>
        //     </>
        //   ),
        // },
        config.features.beaconChain.isEnabled && Boolean(blockQuery.data?.withdrawals_count) ?
          {
            id: 'withdrawals',
            title: 'Withdrawals',
            component: (
              <>
                { blockWithdrawalsQuery.isDegradedData && (
                  <ServiceDegradationWarning isLoading={ blockWithdrawalsQuery.isPlaceholderData } mb={ 6 }/>
                ) }
                <BlockWithdrawals blockWithdrawalsQuery={ blockWithdrawalsQuery }/>
              </>
            ),
          } :
          null,
      ].filter(Boolean),
    [ blockQuery,
      blockTxsQuery,
      normalizedCoinbaseTxsQuery,
      normalizedExternalTxsQuery,
      normalizedConversionTxsQuery,
      blockBlobTxsQuery,
      blockWithdrawalsQuery,
    ],
  );

  const hasPagination =
    !isMobile &&
    ((tab === 'txs' && blockTxsQuery.pagination.isVisible) ||
      (tab === 'withdrawals' && blockWithdrawalsQuery.pagination.isVisible) ||
      (tab === 'coinbase' && blockCoinbaseTxsQuery.pagination.isVisible) ||
      (tab === 'external' && blockExternalTxsQuery.pagination.isVisible) ||
      (tab === 'conversion' && blockConversionTxsQuery.pagination.isVisible));

  let pagination;
  if (tab === 'txs') {
    pagination = blockTxsQuery.pagination;
  } else if (tab === 'withdrawals') {
    pagination = blockWithdrawalsQuery.pagination;
  } else if (tab === 'coinbase') {
    pagination = blockCoinbaseTxsQuery.pagination;
  } else if (tab === 'external') {
    pagination = blockExternalTxsQuery.pagination;
  } else if (tab === 'conversion') {
    pagination = blockConversionTxsQuery.pagination;
  }

  const backLink = React.useMemo(() => {
    const hasGoBackLink = appProps.referrer && appProps.referrer.includes('/blocks');

    if (!hasGoBackLink) {
      return;
    }

    return {
      label: 'Back to blocks list',
      url: appProps.referrer,
    };
  }, [ appProps.referrer ]);

  throwOnAbsentParamError(heightOrHash);
  throwOnResourceLoadError(blockQuery);

  const title = (() => {
    switch (blockQuery.data?.type) {
      case 'reorg':
        return `Reorged block #${ blockQuery.data?.height }`;

      case 'uncle':
        return `Uncle block #${ blockQuery.data?.height }`;

      default:
        return `Block #${ blockQuery.data?.height }`;
    }
  })();
  const titleSecondRow = (
    <>
      { !config.UI.views.block.hiddenFields?.miner && (
        <Skeleton
          isLoaded={ !blockQuery.isPlaceholderData }
          fontFamily="heading"
          display="flex"
          minW={ 0 }
          columnGap={ 2 }
          fontWeight={ 500 }
        >
          <chakra.span flexShrink={ 0 }>
            { config.chain.verificationType === 'validation' ? 'Validated by' : 'Mined by' }
          </chakra.span>
          <AddressEntity address={ blockQuery.data?.miner }/>
        </Skeleton>
      ) }
      <NetworkExplorers
        type="block"
        pathParam={ heightOrHash }
        ml={{ base: config.UI.views.block.hiddenFields?.miner ? 0 : 3, lg: 'auto' }}
      />
    </>
  );

  return (
    <>
      <TextAd mb={ 6 }/>
      <PageTitle
        title={ title }
        backLink={ backLink }
        secondRow={ titleSecondRow }
        isLoading={ blockQuery.isPlaceholderData }
      />
      { blockQuery.isPlaceholderData ? (
        <TabsSkeleton tabs={ tabs }/>
      ) : (
        <RoutedTabs
          tabs={ tabs }
          tabListProps={ isMobile ? undefined : TAB_LIST_PROPS }
          rightSlot={ hasPagination ? <Pagination { ...(pagination as PaginationParams) }/> : null }
          stickyEnabled={ hasPagination }
        />
      ) }
    </>
  );
};

export default BlockPageContent;
