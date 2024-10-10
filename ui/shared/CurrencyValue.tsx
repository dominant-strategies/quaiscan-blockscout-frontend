import { Box, Text, chakra, Skeleton } from '@chakra-ui/react';
import React from 'react';

import getCurrencyValue from 'lib/getCurrencyValue';

import { getCurrencyFromAddress } from './address/utils';

interface Props {
  value: string;
  currency?: string;
  exchangeRate?: string | null;
  className?: string;
  accuracy?: number;
  accuracyUsd?: number;
  decimals?: string | null;
  isLoading?: boolean;
  isCondensed?: boolean;
}

const CurrencyValue = ({
  value,
  currency = '',
  decimals,
  exchangeRate,
  className,
  accuracy,
  accuracyUsd,
  isLoading,
  isCondensed,
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
  const { valueStr: valueResult, usd: usdResult } = getCurrencyValue({
    value,
    accuracy,
    accuracyUsd,
    exchangeRate,
    decimals,
  });
  currency = currency ? getCurrencyFromAddress({ currency }) : '';
  const condensedValue = (value: string, currency: string) => {
    const isDecimalValue = value.indexOf('0.', 0) === 0;
    if (!isCondensed || !isDecimalValue) {
      return (
        <Text display="inline-block">
          { value } { currency }
        </Text>
      );
    }

    const [ number, reminder ] = value.split('.');
    const hasOnlyZeros =
      reminder
        // Disregarding the first and last two numbers
        // which will be shown regardless
        .slice(2, -2)
        .split('')
        .filter((n) => {
          return n !== '0';
        }).length === 0;

    if (reminder.length < 6 || !hasOnlyZeros) {
      return (
        <Text display="inline-block">
          { value } { currency }
        </Text>
      );
    }

    const decimalBegin = reminder.slice(0, 2);
    const decimalEnd = reminder.slice(-2);

    return (
      <Text display="inline-block">
        { `${ number }.${ decimalBegin }` }
        <Text fontSize="10px" display="inline" position="relative" top="0.5">{ `${ reminder.length - 4 }` }</Text>
        { `${ decimalEnd }` } { currency }
      </Text>
    );
  };

  return (
    <Box as="span" className={ className } display="inline-flex" rowGap={ 3 } columnGap={ 1 }>
      { condensedValue(valueResult, currency) }
      { usdResult && (
        <Text as="span" variant="secondary" fontWeight={ 400 }>
          (${ usdResult })
        </Text>
      ) }
    </Box>
  );
};

export default React.memo(chakra(CurrencyValue));
