import { Box, Heading, Text, Flex } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import React, { useMemo } from 'react';

import type { ExternalTransaction } from 'types/api/transaction';

import { route } from 'nextjs-routes';

import config from 'configs/app';
import getValueWithUnit from 'lib/getValueWithUnit';
import useShards from 'lib/hooks/useShards';
import { currencyUnits } from 'lib/units';
import BlobEntity from 'ui/shared/entities/blob/BlobEntity';
import LinkInternal from 'ui/shared/LinkInternal';
import TextSeparator from 'ui/shared/TextSeparator';
import Utilization from 'ui/shared/Utilization/Utilization';

const ExtTxAdditionalInfoContent = ({ tx }: { tx: ExternalTransaction }) => {
  const { extractShardIdFromAddress } = useShards();
  const dataTo = tx.to ? tx.to : tx.created_contract;

  const shardId = useMemo(() => dataTo?.hash && extractShardIdFromAddress(dataTo?.hash), [ dataTo?.hash, extractShardIdFromAddress ]);

  const sectionProps = {
    borderBottom: '1px solid',
    borderColor: 'divider',
    paddingBottom: 4,
  };

  const sectionTitleProps = {
    color: 'gray.500',
    fontWeight: 600,
    marginBottom: 3,
  };

  return (
    <>
      <Heading as="h4" size="sm" mb={ 6 }>Additional info </Heading>
      { tx.blob_versioned_hashes && tx.blob_versioned_hashes.length > 0 && (
        <Box { ...sectionProps } mb={ 4 }>
          <Flex alignItems="center" justifyContent="space-between">
            <Text { ...sectionTitleProps }>Blobs: { tx.blob_versioned_hashes.length }</Text>
            { tx.blob_versioned_hashes.length > 3 && (
              <LinkInternal
                href={ route({ pathname: '/tx/[hash]', query: { hash: tx.hash, tab: 'blobs' } }) }
                mb={ 3 }
              >
                view all
              </LinkInternal>
            ) }
          </Flex>
          <Flex flexDir="column" rowGap={ 3 }>
            { tx.blob_versioned_hashes.slice(0, 3).map((hash, index) => (
              <Flex key={ hash } columnGap={ 2 }>
                <Box fontWeight={ 500 }>{ index + 1 }</Box>
                <BlobEntity hash={ hash } noIcon/>
              </Flex>
            )) }
          </Flex>
        </Box>
      ) }
      { tx.gas_used !== null && (
        <Box { ...sectionProps } mb={ 4 }>
          <Text { ...sectionTitleProps }>Gas limit & usage by transaction</Text>
          <Flex>
            <Text>{ BigNumber(tx.gas_used).toFormat() }</Text>
            <TextSeparator/>
            <Text>{ BigNumber(tx.gas_limit).toFormat() }</Text>
            <Utilization ml={ 4 } value={ Number(BigNumber(tx.gas_used).dividedBy(BigNumber(tx.gas_limit)).toFixed(2)) }/>
          </Flex>
        </Box>
      ) }
      { !(tx.blob_versioned_hashes && tx.blob_versioned_hashes.length > 0) && (
        <Box { ...sectionProps } mb={ 4 }>
          <Text { ...sectionTitleProps }>Others</Text>
          <Box>
            <Text as="span" fontWeight="500">Txn type: </Text>
            <Text fontWeight="600" as="span">{ tx.type }</Text>
            { tx.type === 2 && <Text fontWeight="400" as="span" ml={ 1 } color="gray.500">(EIP-1559)</Text> }
          </Box>
          <Box mt={ 1 }>
            <Text as="span" fontWeight="500">Nonce: </Text>
            <Text fontWeight="600" as="span">{ tx.nonce }</Text>
          </Box>
          <Box mt={ 1 }>
            <Text as="span" fontWeight="500">Position: </Text>
            <Text fontWeight="600" as="span">{ tx.position }</Text>
          </Box>
        </Box>
      ) }
      <LinkInternal href={ route({ pathname: '/tx/[hash]', query: { hash: tx.hash, shard: shardId } }) }>More details</LinkInternal>
    </>
  );
};

export default React.memo(ExtTxAdditionalInfoContent);
