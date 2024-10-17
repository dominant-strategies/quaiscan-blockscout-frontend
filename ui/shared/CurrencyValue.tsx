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
    if (!isCondensed) {
      return (
        <Text display="inline-block">
          { value } { currency }
        </Text>
      );
    }

    const [ number, reminder ] = value.split('.');

    if (!reminder) {
      return (
        <Text display="inline-block">
          { value } { currency }
        </Text>
      );
    }

    const begin = reminder.slice(0, 6);
    const isBeginOnlyZeros =
      begin.split('').filter((n) => {
        return n === '0';
      }).length === begin.length;

    const mid = reminder.slice(6, -6);
    const isMidOnlyZeros =
      mid.split('').filter((n) => {
        return n === '0';
      }).length === mid.length;

    const end = reminder.slice(-6);

    if (isBeginOnlyZeros && !isMidOnlyZeros) {
      return (
        <Text display="inline-block">
          { value } { currency }
        </Text>
      );
    }

    return (
      <Text display="inline-block">
        { `${ number }.${ begin }` }
        <Text fontSize="10px" display="inline" position="relative" top="0.5">{ `${ mid.length }` }</Text>
        { `${ end }` } { currency }
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
