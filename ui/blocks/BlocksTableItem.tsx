import { Tr, Td, Flex, Text, Box, Tooltip, Skeleton, useColorModeValue } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import { motion } from 'framer-motion';
import React from 'react';
import type { ReactElement } from 'react';

import type { AddressParam } from '../../types/api/addressParams';
import type { Block, DynamicReward } from 'types/api/block';

import { route } from 'nextjs-routes';

import config from 'configs/app';
import { WEI } from 'lib/consts';
import BlockTimestamp from 'ui/blocks/BlockTimestamp';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import BlockEntity from 'ui/shared/entities/block/BlockEntity';
import GasUsedToTargetRatio from 'ui/shared/GasUsedToTargetRatio';
import IconSvg from 'ui/shared/IconSvg';
import LinkInternal from 'ui/shared/LinkInternal';
import TextSeparator from 'ui/shared/TextSeparator';
import Utilization from 'ui/shared/Utilization/Utilization';

interface Props {
  data: Block;
  isLoading?: boolean;
  enableTimeIncrement?: boolean;
}

const isRollup = config.features.rollup.isEnabled;

function minerAddressToAddressParam(address: string): AddressParam {
  const thirdChar = address[4];
  const thirdDigit = parseInt(thirdChar, 16);
  return {
    hash: address,
    implementation_name: null,
    name: null,
    is_contract: false,
    is_verified: null,
    ens_domain_name: null,
    currency: thirdDigit > 7 ? 'qi' : 'quai',
    private_tags: null,
    watchlist_names: null,
    public_tags: null,
  };
}

function MinersList({ dynamicRewards, isLoading }: { dynamicRewards: Array<DynamicReward> | undefined; isLoading: boolean | undefined }): ReactElement {
  if (!dynamicRewards || !dynamicRewards?.length) {
    return <Box>-</Box>;
  }

  return (
    <Box>
      { dynamicRewards.map((dr, idx) => (
        <Box key={ idx } mb={ 2 }>
          <AddressEntity
            address={ minerAddressToAddressParam(dr.address_hash) }
            isLoading={ isLoading }
            truncation="constant"
          />
        </Box>
      )) }
    </Box>
  );
}

function RewardsList({ dynamicRewards }: { dynamicRewards: Array<DynamicReward> | undefined }): React.ReactElement {
  if (!dynamicRewards || dynamicRewards.length === 0) {
    return <Box>-</Box>;
  }

  const formatReward = (dr: DynamicReward): string => {
    const thirdChar = dr.address_hash[4];
    if (!thirdChar) {
      return '-';
    }

    const thirdDigit = parseInt(thirdChar, 16);
    if (isNaN(thirdDigit)) {
      return '-';
    }

    const rewardFloat = parseFloat(dr.reward);
    return thirdDigit > 7 ?
      `${ (rewardFloat / 1000).toFixed(3) } qi` :
      `${ (rewardFloat / 1e18).toFixed(8) } quai`;
  };

  return (
    <Box>
      { dynamicRewards.map((dr, idx) => (
        <Flex key={ idx } align="center" mb={ 2 }>
          <Box
            w="8px"
            h="8px"
            borderRadius="full"
            bg={ dr.finalized ? 'green.500' : 'yellow.500' }
            mr={ 2 }
          />
          <Text fontSize="sm">{ formatReward(dr) }</Text>
        </Flex>
      )) }
    </Box>
  );
}

const BlocksTableItem = ({ data, isLoading, enableTimeIncrement }: Props) => {
  const rewardCurrency = data.miner.currency as string;
  const burntFees = BigNumber(data.burnt_fees || 0);
  const txFees = BigNumber(data.tx_fees || 0);

  const separatorColor = useColorModeValue('gray.200', 'gray.700');
  const burntFeesIconColor = useColorModeValue('gray.500', 'inherit');

  return (
    <Tr
      as={ motion.tr }
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transitionDuration="normal"
      transitionTimingFunction="linear"
      key={ data.height }
    >
      <Td fontSize="sm">
        <Flex columnGap={ 2 } alignItems="center" mb={ 2 }>
          <Tooltip isDisabled={ data.type !== 'reorg' } label="Chain reorganizations">
            <BlockEntity
              isLoading={ isLoading }
              number={ data.height }
              hash={ data.type !== 'block' ? data.hash : undefined }
              noIcon
              fontSize="sm"
              lineHeight={ 5 }
              fontWeight={ 600 }
            />
          </Tooltip>
        </Flex>
        <BlockTimestamp ts={ data.timestamp } isEnabled={ enableTimeIncrement } isLoading={ isLoading }/>
      </Td>
      <Td fontSize="sm">
        <Skeleton isLoaded={ !isLoading } display="inline-block">
          { data.size.toLocaleString() }
        </Skeleton>
      </Td>
      <Td isNumeric fontSize="sm">
        { data.tx_count > 0 ? (
          <Skeleton isLoaded={ !isLoading } display="inline-block">
            <LinkInternal
              href={ route({
                pathname: '/block/[height_or_hash]',
                query: { height_or_hash: String(data.height), tab: 'txs' },
              }) }
            >
              { data.tx_count }
            </LinkInternal>
          </Skeleton>
        ) : (
          data.tx_count
        ) }
      </Td>
      { !isRollup && !config.UI.views.block.hiddenFields?.total_reward && (
        <Td fontSize="sm">
          <Skeleton isLoaded={ !isLoading } display="inline-block">
            { BigNumber(data.gas_used || 0).toFormat() }
          </Skeleton>
          <Flex mt={ 2 }>
            <Tooltip label={ isLoading ? undefined : 'Gas Used %' }>
              <Box>
                <Utilization
                  colorScheme="gray"
                  value={ BigNumber(data.gas_used || 0)
                    .dividedBy(BigNumber(data.gas_limit))
                    .toNumber() }
                  isLoading={ isLoading }
                />
              </Box>
            </Tooltip>
            { data.gas_target_percentage && (
              <>
                <TextSeparator color={ separatorColor } mx={ 1 }/>
                <GasUsedToTargetRatio value={ data.gas_target_percentage } isLoading={ isLoading }/>
              </>
            ) }
          </Flex>
        </Td>
      ) }
      { !config.UI.views.block.hiddenFields?.miner && (
        <Td fontSize="sm">
          <Skeleton isLoaded={ !isLoading } display="inline-block">
            <MinersList dynamicRewards={ data.dynamic_rewards } isLoading={ isLoading }/>
          </Skeleton>
        </Td>
      ) }
      <Td fontSize="sm">
        <Skeleton isLoaded={ !isLoading } display="inline-block">
          <RewardsList dynamicRewards={ data.dynamic_rewards }/>
        </Skeleton>
      </Td>
      { !isRollup && !config.UI.views.block.hiddenFields?.burnt_fees && (
        <Td fontSize="sm">
          <Flex alignItems="center" columnGap={ 2 }>
            <IconSvg name="flame" boxSize={ 5 } color={ burntFeesIconColor } isLoading={ isLoading }/>
            <Skeleton isLoaded={ !isLoading } display="inline-block">
              { burntFees.dividedBy(WEI).toFixed(8) } { rewardCurrency }
            </Skeleton>
          </Flex>
          <Tooltip label={ isLoading ? undefined : 'Burnt fees / Txn fees * 100%' }>
            <Box w="min-content">
              <Utilization mt={ 2 } value={ burntFees.div(txFees).toNumber() } isLoading={ isLoading }/>
            </Box>
          </Tooltip>
        </Td>
      ) }
    </Tr>
  );
};

export default React.memo(BlocksTableItem);
