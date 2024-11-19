import { Skeleton } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import React from 'react';

import config from 'configs/app';
import { WEI, WEI_IN_GWEI } from 'lib/consts';
import { currencyUnits } from 'lib/units';
import DetailsInfoItem from 'ui/shared/DetailsInfoItem';

interface Props {
  gasPrice: string | null;
  isLoading?: boolean;
  gasCurrency?: string;
}

const TxDetailsGasPrice = ({ gasPrice, gasCurrency = '', isLoading }: Props) => {
  if (config.UI.views.tx.hiddenFields?.gas_price || !gasPrice) {
    return null;
  }
  gasCurrency = `${ gasCurrency?.charAt(0).toUpperCase() }${ gasCurrency?.slice(1) }`;

  return (
    <DetailsInfoItem
      title="Gas price"
      hint="Price per unit of gas specified by the sender. Higher gas prices can prioritize transaction inclusion during times of high usage"
      isLoading={ isLoading }
    >
      <Skeleton isLoaded={ !isLoading } mr={ 1 }>
        { BigNumber(gasPrice).dividedBy(WEI).toFixed() } { gasCurrency ? gasCurrency : currencyUnits.ether }
      </Skeleton>
      <Skeleton isLoaded={ !isLoading } color="text_secondary">
        <span>
          { /* eslint-disable-next-line no-nested-ternary */ }
          ({ BigNumber(gasPrice).dividedBy(WEI_IN_GWEI).toFixed() } { gasCurrency === 'Quai' ? 'Gwei' : gasCurrency || currencyUnits.ether })
        </span>
      </Skeleton>
    </DetailsInfoItem>
  );
};

export default TxDetailsGasPrice;
