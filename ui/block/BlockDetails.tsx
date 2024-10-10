import { Grid, GridItem, Text, Link, Box, Tooltip, useColorModeValue, Skeleton } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import capitalize from 'lodash/capitalize';
import { useRouter } from 'next/router';
import React from 'react';
import { scroller, Element } from 'react-scroll';

import { route } from 'nextjs-routes';

import config from 'configs/app';
import getBlockReward from 'lib/block/getBlockReward';
import { GWEI, WEI, WEI_IN_GWEI, ZERO } from 'lib/consts';
import { space } from 'lib/html-entities';
import getNetworkValidatorTitle from 'lib/networks/getNetworkValidatorTitle';
import getQueryParamString from 'lib/router/getQueryParamString';
import { currencyUnits } from 'lib/units';
import CopyToClipboard from 'ui/shared/CopyToClipboard';
import DetailsInfoItem from 'ui/shared/DetailsInfoItem';
import DetailsInfoItemDivider from 'ui/shared/DetailsInfoItemDivider';
import DetailsTimestamp from 'ui/shared/DetailsTimestamp';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import GasUsedToTargetRatio from 'ui/shared/GasUsedToTargetRatio';
import HashStringShorten from 'ui/shared/HashStringShorten';
import HashStringShortenDynamic from 'ui/shared/HashStringShortenDynamic';
import IconSvg from 'ui/shared/IconSvg';
import LinkInternal from 'ui/shared/LinkInternal';
import PrevNext from 'ui/shared/PrevNext';
import TextSeparator from 'ui/shared/TextSeparator';
import Utilization from 'ui/shared/Utilization/Utilization';

import BlockDetailsBlobInfo from './details/BlockDetailsBlobInfo';
import type { BlockQuery } from './useBlockQuery';

interface Props {
  query: BlockQuery;
}

const rollupFeature = config.features.rollup;

const BlockDetails = ({ query }: Props) => {
  const [ isExpanded, setIsExpanded ] = React.useState(false);
  const router = useRouter();
  const heightOrHash = getQueryParamString(router.query.height_or_hash);

  const separatorColor = useColorModeValue('gray.200', 'gray.700');

  const { data, isPlaceholderData } = query;

  const handleCutClick = React.useCallback(() => {
    setIsExpanded((flag) => !flag);
    scroller.scrollTo('BlockDetails__cutLink', {
      duration: 500,
      smooth: true,
    });
  }, []);

  const handlePrevNextClick = React.useCallback(
    (direction: 'prev' | 'next') => {
      if (!data) {
        return;
      }

      const increment = direction === 'next' ? +1 : -1;
      const nextId = String(data.height + increment);

      router.push({ pathname: '/block/[height_or_hash]', query: { height_or_hash: nextId } }, undefined);
    },
    [ data, router ],
  );

  if (!data) {
    return null;
  }

  const { totalReward, staticReward, burntFees, txFees } = getBlockReward(data);

  const validatorTitle = getNetworkValidatorTitle();

  const rewardBreakDown = (() => {
    if (rollupFeature.isEnabled || totalReward.isEqualTo(ZERO) || txFees.isEqualTo(ZERO) || burntFees.isEqualTo(ZERO)) {
      return null;
    }

    if (isPlaceholderData) {
      return <Skeleton w="525px" h="20px"/>;
    }

    return (
      <Text variant="secondary" whiteSpace="break-spaces">
        <Tooltip label="Static block reward">
          <span>{ staticReward.dividedBy(WEI).toFixed() }</span>
        </Tooltip>
        { !txFees.isEqualTo(ZERO) && (
          <>
            { space }+{ space }
            <Tooltip label="Txn fees">
              <span>{ txFees.dividedBy(WEI).toFixed() }</span>
            </Tooltip>
          </>
        ) }
        { !burntFees.isEqualTo(ZERO) && (
          <>
            { space }-{ space }
            <Tooltip label="Burnt fees">
              <span>{ burntFees.dividedBy(WEI).toFixed() }</span>
            </Tooltip>
          </>
        ) }
      </Text>
    );
  })();

  const verificationTitle = (() => {
    if (rollupFeature.isEnabled && rollupFeature.type === 'zkEvm') {
      return 'Sequenced by';
    }

    return config.chain.verificationType === 'validation' ? 'Validated by' : 'Mined by';
  })();

  const txsNum = (() => {
    const blockTxsNum = (
      <LinkInternal
        href={ route({ pathname: '/block/[height_or_hash]', query: { height_or_hash: heightOrHash, tab: 'txs' } }) }
      >
        { data.tx_count } txn{ data.tx_count === 1 ? '' : 's' }
      </LinkInternal>
    );

    const blockBlobTxsNum = data.blob_tx_count ? (
      <>
        <span> and </span>
        <LinkInternal
          href={ route({
            pathname: '/block/[height_or_hash]',
            query: { height_or_hash: heightOrHash, tab: 'blob_txs' },
          }) }
        >
          { data.blob_tx_count } blob txn{ data.blob_tx_count === 1 ? '' : 's' }
        </LinkInternal>
      </>
    ) : null;

    return (
      <>
        { blockTxsNum }
        { blockBlobTxsNum }
        <span> in this block</span>
      </>
    );
  })();

  const blockTypeLabel = (() => {
    switch (data.type) {
      case 'reorg':
        return 'Reorg';
      case 'uncle':
        return 'Uncle';
      default:
        return 'Block';
    }
  })();

  return (
    <Grid
      columnGap={ 8 }
      rowGap={{ base: 3, lg: 3 }}
      templateColumns={{ base: 'minmax(0, 1fr)', lg: 'minmax(min-content, 200px) minmax(0, 1fr)' }}
      overflow="hidden"
    >
      <DetailsInfoItem
        title={ `${ blockTypeLabel } height` }
        hint="The block height of a particular block is defined as the number of blocks preceding it in the blockchain"
        isLoading={ isPlaceholderData }
      >
        <Skeleton isLoaded={ !isPlaceholderData }>{ data.height }</Skeleton>
        { data.height === 0 && <Text whiteSpace="pre"> - Genesis Block</Text> }
        <PrevNext
          ml={ 6 }
          onClick={ handlePrevNextClick }
          prevLabel="View previous block"
          nextLabel="View next block"
          isPrevDisabled={ data.height === 0 }
          isLoading={ isPlaceholderData }
        />
      </DetailsInfoItem>

      { data.wo_header && (
        <DetailsInfoItem title="Location" hint="Location at which block was produced" isLoading={ isPlaceholderData }>
          <Skeleton isLoaded={ !isPlaceholderData }>{ data.wo_header.location }</Skeleton>
        </DetailsInfoItem>
      ) }

      <DetailsInfoItem title="Size" hint="Size of the block in bytes" isLoading={ isPlaceholderData }>
        <Skeleton isLoaded={ !isPlaceholderData }>{ data.size.toLocaleString() }</Skeleton>
      </DetailsInfoItem>
      <DetailsInfoItem title="Timestamp" hint="Date & time at which block was produced." isLoading={ isPlaceholderData }>
        <DetailsTimestamp timestamp={ data.timestamp } isLoading={ isPlaceholderData }/>
      </DetailsInfoItem>
      <DetailsInfoItem
        title="Transactions"
        hint="The number of transactions in the block"
        isLoading={ isPlaceholderData }
      >
        <Skeleton isLoaded={ !isPlaceholderData }>{ txsNum }</Skeleton>
      </DetailsInfoItem>
      { /* <DetailsInfoItem
        title="External Transactions"
        hint="The number of external transactions in the block"
        isLoading={ isPlaceholderData }
      >
        <Skeleton isLoaded={ !isPlaceholderData }>{ extTxsNum }</Skeleton>
      </DetailsInfoItem> */ }
      { config.features.beaconChain.isEnabled && Boolean(data.withdrawals_count) && (
        <DetailsInfoItem
          title="Withdrawals"
          hint="The number of beacon withdrawals in the block"
          isLoading={ isPlaceholderData }
        >
          <Skeleton isLoaded={ !isPlaceholderData }>
            <LinkInternal
              href={ route({
                pathname: '/block/[height_or_hash]',
                query: { height_or_hash: heightOrHash, tab: 'withdrawals' },
              }) }
            >
              { data.withdrawals_count } withdrawal{ data.withdrawals_count === 1 ? '' : 's' }
            </LinkInternal>
          </Skeleton>
        </DetailsInfoItem>
      ) }
      { !config.UI.views.block.hiddenFields?.miner && (
        <DetailsInfoItem
          title={ verificationTitle }
          hint="A block producer who successfully included the block onto the blockchain"
          columnGap={ 1 }
          isLoading={ isPlaceholderData }
        >
          <AddressEntity address={ data.miner } isLoading={ isPlaceholderData }/>
          { /* api doesn't return the block processing time yet */ }
          { /* <Text>{ dayjs.duration(block.minedIn, 'second').humanize(true) }</Text> */ }
        </DetailsInfoItem>
      ) }
      { !rollupFeature.isEnabled &&
        !totalReward.isEqualTo(ZERO) &&
        !config.UI.views.block.hiddenFields?.total_reward && (
        <DetailsInfoItem
          title="Block reward"
          hint={ `For each block, the ${ validatorTitle } is rewarded with a finite amount of ${
            config.chain.currency.symbol || 'native token'
          }
          on top of the fees paid for all transactions in the block` }
          columnGap={ 1 }
          isLoading={ isPlaceholderData }
        >
          <Skeleton isLoaded={ !isPlaceholderData }>
            { totalReward.dividedBy(WEI).toFixed() } { currencyUnits.ether }
          </Skeleton>
          { rewardBreakDown }
        </DetailsInfoItem>
      ) }
      { data.rewards
        ?.filter(({ type }) => type !== 'Validator Reward' && type !== 'Miner Reward')
        .map(({ type, reward }) => (
          <DetailsInfoItem
            key={ type }
            title={ type }
            // is this text correct for validators?
            hint={ `Amount of distributed reward. ${ capitalize(
              validatorTitle,
            ) }s receive a static block reward + Tx fees + uncle fees` }
          >
            { BigNumber(reward).dividedBy(WEI).toFixed() } { currencyUnits.ether }
          </DetailsInfoItem>
        )) }

      <DetailsInfoItemDivider/>

      <DetailsInfoItem
        title="Gas used"
        hint="The total gas amount used in the block and its percentage of gas filled in the block"
        isLoading={ isPlaceholderData }
      >
        <Skeleton isLoaded={ !isPlaceholderData }>{ BigNumber(data.gas_used || 0).toFormat() }</Skeleton>
        <Utilization
          ml={ 4 }
          colorScheme="gray"
          value={ BigNumber(data.gas_used || 0)
            .dividedBy(BigNumber(data.gas_limit))
            .toNumber() }
          isLoading={ isPlaceholderData }
        />
        { data.gas_target_percentage && (
          <>
            <TextSeparator color={ separatorColor } mx={ 1 }/>
            <GasUsedToTargetRatio value={ data.gas_target_percentage } isLoading={ isPlaceholderData }/>
          </>
        ) }
      </DetailsInfoItem>
      <DetailsInfoItem
        title="Gas limit"
        hint="Total gas limit provided by all transactions in the block"
        isLoading={ isPlaceholderData }
      >
        <Skeleton isLoaded={ !isPlaceholderData }>{ BigNumber(data.gas_limit).toFormat() }</Skeleton>
      </DetailsInfoItem>
      { data.minimum_gas_price && (
        <DetailsInfoItem
          title="Minimum gas price"
          hint="The minimum gas price a transaction should have in order to be included in this block"
          isLoading={ isPlaceholderData }
        >
          <Skeleton isLoaded={ !isPlaceholderData }>
            { BigNumber(data.minimum_gas_price).dividedBy(GWEI).toFormat() } { currencyUnits.gwei }
          </Skeleton>
        </DetailsInfoItem>
      ) }
      { data.base_fee_per_gas && (
        <DetailsInfoItem
          title="Base fee per gas"
          hint="Minimum fee required per unit of gas. Fee adjusts based on network congestion"
          isLoading={ isPlaceholderData }
        >
          { isPlaceholderData ? (
            <Skeleton isLoaded={ !isPlaceholderData } h="20px" maxW="380px" w="100%"/>
          ) : (
            <>
              <Text>
                { BigNumber(data.base_fee_per_gas).dividedBy(WEI).toFixed() } { currencyUnits.ether }{ ' ' }
              </Text>
              <Text variant="secondary" whiteSpace="pre">
                { space }({ BigNumber(data.base_fee_per_gas).dividedBy(WEI_IN_GWEI).toFixed() } { currencyUnits.gwei })
              </Text>
            </>
          ) }
        </DetailsInfoItem>
      ) }
      { !config.UI.views.block.hiddenFields?.burnt_fees && !burntFees.isEqualTo(ZERO) && (
        <DetailsInfoItem
          title="Burnt fees"
          hint={ `Amount of ${
            config.chain.currency.symbol || 'native token'
          } burned from transactions included in the block.

          Equals Block Base Fee per Gas * Gas Used` }
          isLoading={ isPlaceholderData }
        >
          <IconSvg name="flame" boxSize={ 5 } color="gray.500" isLoading={ isPlaceholderData }/>
          <Skeleton isLoaded={ !isPlaceholderData } ml={ 2 }>
            { burntFees.dividedBy(WEI).toFixed() } { currencyUnits.ether }
          </Skeleton>
          { !txFees.isEqualTo(ZERO) && (
            <Tooltip label="Burnt fees / Txn fees * 100%">
              <Box>
                <Utilization ml={ 4 } value={ burntFees.dividedBy(txFees).toNumber() } isLoading={ isPlaceholderData }/>
              </Box>
            </Tooltip>
          ) }
        </DetailsInfoItem>
      ) }
      { data.priority_fee !== null && BigNumber(data.priority_fee).gt(ZERO) && (
        <DetailsInfoItem
          title="Priority fee / Tip"
          hint="User-defined tips sent to validator for transaction priority/inclusion"
          isLoading={ isPlaceholderData }
        >
          <Skeleton isLoaded={ !isPlaceholderData }>
            { BigNumber(data.priority_fee).dividedBy(WEI).toFixed() } { currencyUnits.ether }
          </Skeleton>
        </DetailsInfoItem>
      ) }
      { /* api doesn't support extra data yet */ }
      { /* <DetailsInfoItem
        title="Extra data"
        hint={ `Any data that can be included by the ${ validatorTitle } in the block` }
      >
        <Text whiteSpace="pre">{ data.extra_data } </Text>
        <Text variant="secondary">(Hex: { data.extra_data })</Text>
      </DetailsInfoItem> */ }

      { /* CUT */ }
      <GridItem colSpan={{ base: undefined, lg: 2 }}>
        <Element name="BlockDetails__cutLink">
          <Skeleton isLoaded={ !isPlaceholderData } mt={ 6 } display="inline-block">
            <Link fontSize="sm" textDecorationLine="underline" textDecorationStyle="dashed" onClick={ handleCutClick }>
              { isExpanded ? 'Hide details' : 'View details' }
            </Link>
          </Skeleton>
        </Element>
      </GridItem>

      { /* ADDITIONAL INFO */ }
      { isExpanded && !isPlaceholderData && (
        <>
          <GridItem colSpan={{ base: undefined, lg: 2 }} mt={{ base: 1, lg: 4 }}/>

          { !isPlaceholderData && <BlockDetailsBlobInfo data={ data }/> }

          { data.wo_header && (
            <>
              <DetailsInfoItem
                title="Difficulty"
                note="Work object header"
                noteAlign="left"
                hint={ `Block difficulty for ${ validatorTitle }, used to calibrate block generation time` }
              >
                <Box whiteSpace="nowrap" overflow="hidden">
                  <HashStringShortenDynamic hash={ BigNumber(data.wo_header!.difficulty).toFormat() }/>
                </Box>
              </DetailsInfoItem>

              <DetailsInfoItem title="Location" note="Work object header" noteAlign="left" hint="Block location">
                <Box whiteSpace="nowrap" overflow="hidden">
                  <HashStringShorten hash={ data.wo_header!.location }/>
                </Box>
                <CopyToClipboard text={ data.wo_header!.location }/>
              </DetailsInfoItem>

              <DetailsInfoItem title="MixHash" note="Work object header" noteAlign="left" hint="Block mixHash">
                <Box whiteSpace="nowrap" overflow="hidden">
                  <HashStringShortenDynamic hash={ data.wo_header!.mixHash }/>
                </Box>
                <CopyToClipboard text={ data.wo_header!.mixHash }/>
              </DetailsInfoItem>

              <DetailsInfoItem
                title="Nonce"
                note="Work object header"
                noteAlign="left"
                hint="Block nonce is a value used during mining to demonstrate proof of work for a block"
              >
                <Box whiteSpace="nowrap" overflow="hidden">
                  <HashStringShortenDynamic hash={ data.wo_header!.nonce.toString() }/>
                </Box>
              </DetailsInfoItem>
              <DetailsInfoItem title="Block number" note="Work object header" noteAlign="left" hint="Block number">
                <Box whiteSpace="nowrap" overflow="hidden">
                  <HashStringShortenDynamic hash={ data.wo_header!.number.toString() }/>
                </Box>
                <CopyToClipboard text={ data.wo_header!.number }/>
              </DetailsInfoItem>

              <DetailsInfoItem
                title="Parent Hash"
                note="Work object header"
                noteAlign="left"
                hint="The hash of the block from which this block was generated"
              >
                <Box whiteSpace="nowrap" overflow="hidden">
                  <LinkInternal
                    href={ route({
                      pathname: '/block/[height_or_hash]',
                      query: { height_or_hash: String(data.height - 1) },
                    }) }
                    overflow="hidden"
                    whiteSpace="nowrap"
                  >
                    <HashStringShortenDynamic hash={ data.wo_header!.parentHash }/>
                  </LinkInternal>
                  <CopyToClipboard text={ data.wo_header!.parentHash }/>
                </Box>
              </DetailsInfoItem>

              <DetailsInfoItem title="Time" note="Work object header" noteAlign="left" hint="Block time">
                <Box whiteSpace="nowrap" overflow="hidden">
                  <HashStringShortenDynamic hash={ data.wo_header!.timestamp }/>
                </Box>
                <CopyToClipboard text={ data.wo_header!.timestamp }/>
              </DetailsInfoItem>
            </>
          ) }

          { data.total_difficulty && (
            <DetailsInfoItem title="Total difficulty" hint="Total difficulty of the chain until this block">
              <Box whiteSpace="nowrap" overflow="hidden">
                <HashStringShortenDynamic hash={ BigNumber(data.total_difficulty).toFormat() }/>
              </Box>
            </DetailsInfoItem>
          ) }

          <DetailsInfoItem title="Hash" hint="The SHA256 hash of the block" flexWrap="nowrap">
            <Box overflow="hidden">
              <HashStringShortenDynamic hash={ data.hash }/>
            </Box>
            <CopyToClipboard text={ data.hash }/>
          </DetailsInfoItem>

          { !config.UI.views.block.hiddenFields?.totalEntropy && (
            <DetailsInfoItem title="Total Entropy" hint="Total entropy reduced by the chain until this block">
              { data.total_entropy }
            </DetailsInfoItem>
          ) }

          { !config.UI.views.block.hiddenFields?.manifestHash && (
            <DetailsInfoItem title="Manifest Hash" hint="Manifest Hash when block was produced">
              { data.manifest_hash_full &&
                data.manifest_hash_full.map((hash, index) => (
                  <Box key={ index } w="100%">
                    <HashStringShortenDynamic hash={ hash }/>
                  </Box>
                )) }
            </DetailsInfoItem>
          ) }

          { !config.UI.views.block.hiddenFields?.extRollupRoot && (
            <DetailsInfoItem title="Ext Rollup Root Hash" hint="Ext Rollup Root Hash when block was produced">
              { data.ext_rollup_root }
            </DetailsInfoItem>
          ) }

          { !config.UI.views.block.hiddenFields?.evmRoot && (
            <DetailsInfoItem title="Evm Root" hint="Evm Root when block was produced">
              { data.evm_root }
            </DetailsInfoItem>
          ) }

          { !config.UI.views.block.hiddenFields?.utxoRoot && (
            <DetailsInfoItem title="UTXO Root" hint="UTXO Root when block was produced">
              { data.utxo_root }
            </DetailsInfoItem>
          ) }

          { !config.UI.views.block.hiddenFields?.etxSetHash && (
            <DetailsInfoItem title="Etx Set Root" hint="Etx Set Root when block was produced">
              { data.etx_set_root }
            </DetailsInfoItem>
          ) }

          { !config.UI.views.block.hiddenFields?.etxEligibleSlices && (
            <DetailsInfoItem title="Etx Eligible Slices" hint="Etx Eligible Slices when block was produced">
              { data.etx_eligible_slices }
            </DetailsInfoItem>
          ) }

          { !config.UI.views.block.hiddenFields?.parentUncledDeltaEntropy && (
            <DetailsInfoItem title="Parent Uncled Sub Delta S" hint="Parent Uncled Sub Delta S when block was produced">
              { data.parent_uncled_sub_delta_s &&
                data.parent_uncled_sub_delta_s.map((hash, index) => (
                  <Box key={ index } w="100%">
                    <HashStringShortenDynamic hash={ hash }/>
                  </Box>
                )) }
            </DetailsInfoItem>
          ) }

          { !config.UI.views.block.hiddenFields?.efficiencyScore && (
            <DetailsInfoItem title="Efficiency Score" hint="Efficiency Score when block was produced">
              { data.efficiency_score }
            </DetailsInfoItem>
          ) }

          { !config.UI.views.block.hiddenFields?.thresholdCount && (
            <DetailsInfoItem title="Threshold Count" hint="Threshold Count when block was produced">
              { data.threshold_count }
            </DetailsInfoItem>
          ) }

          { !config.UI.views.block.hiddenFields?.expansionNumber && (
            <DetailsInfoItem title="Expansion Number" hint="Expansion Number when block was produced">
              { data.expansion_number }
            </DetailsInfoItem>
          ) }

          { !config.UI.views.block.hiddenFields?.primeTerminus && (
            <DetailsInfoItem title="Prime Terminus" hint="Prime Terminus when block was produced">
              { data.prime_terminus }
            </DetailsInfoItem>
          ) }

          { !config.UI.views.block.hiddenFields?.interlinkHashes && (
            <DetailsInfoItem title="Interlink Hashes" hint="Interlink Hashes when block was produced">
              { data.interlink_hashes }
            </DetailsInfoItem>
          ) }

          { !config.UI.views.block.hiddenFields?.interlinkRootHash && (
            <DetailsInfoItem title="Interlink Root Hash" hint="Interlink Root Hash when block was produced">
              { data.interlink_root_hash }
            </DetailsInfoItem>
          ) }

          { !config.UI.views.block.hiddenFields?.uncledEntropy && (
            <DetailsInfoItem title="Uncled S" hint="Uncled S when block was produced">
              { data.uncled_s }
            </DetailsInfoItem>
          ) }
        </>
      ) }
    </Grid>
  );
};

export default BlockDetails;
