import { Box, Text, chakra, Skeleton } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import React from 'react';

import getCurrencyValue from 'lib/getCurrencyValue';

import { getCurrencyFromAddress } from './address/utils';

interface Props {
  value: string;
  currency?: string | null;
  exchangeRate?: string | null;
  className?: string;
  accuracy?: number;
  accuracyUsd?: number;
  decimals?: string | null;
  isLoading?: boolean;
}

const CurrencyValue = ({
  value,
  currency,
  decimals,
  exchangeRate,
  className,
  accuracy,
  accuracyUsd,
  isLoading,
}: Props) => {
  if (isLoading) {
    return (
      <Skeleton className={ className } display="inline-block">
        0.00 ($0.00)
      </Skeleton>
    );
  }

  if (value === undefined || value === null) {
    return (
      <Box as="span" className={ className }>
        <Text>N/A</Text>
      </Box>
    );
  }

  currency = currency ? getCurrencyFromAddress({ currency }) : '';
  if (currency === 'Qi') {
    decimals = '3';
  }

  let condensedValue;
  const { valueStr: valueResult, usd: usdResult } = getCurrencyValue({
    value,
    accuracy,
    accuracyUsd,
    exchangeRate,
    decimals,
  });

  if (valueResult === '0' && currency !== 'Qi') {
    const { valueStr: wholeValueResult } = getCurrencyValue({
      value,
      accuracy: 0,
      accuracyUsd,
      exchangeRate,
      decimals: '18',
    });

    condensedValue = condenseSmallValue(wholeValueResult);
  }

  return (
    <Box as="span" className={ className } display="inline-flex" rowGap={ 3 } columnGap={ 1 }>
      <Text display="inline-block">
        { condensedValue ? condensedValue : valueResult } { currency }
      </Text>
      { usdResult && (
        <Text as="span" variant="secondary" fontWeight={ 400 }>
          (${ usdResult })
        </Text>
      ) }
    </Box>
  );
};

function condenseSmallValue(value: string): ReactNode | null {
  const [ number, reminder ] = value.split('.');
  if (!reminder) {
    return null;
  }

  const valueBeginAtIndex = reminder.split('').findIndex((n) => n !== '0');

  return (
    <span>
      { `${ number }.${ reminder[0] }` }
      <Text fontSize="10px" display="inline" position="relative" top="0.5">{ `${ valueBeginAtIndex - 1 }` }</Text>
      { reminder[valueBeginAtIndex] }
    </span>
  );
}

export default React.memo(chakra(CurrencyValue));
