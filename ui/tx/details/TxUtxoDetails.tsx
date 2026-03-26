import { Box, Flex, Text } from '@chakra-ui/react';
import { denominations, formatQi } from 'quais';
import React from 'react';

import type { Transaction, UtxoTransaction } from 'types/api/transaction';

import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import TxEntity from 'ui/shared/entities/tx/TxEntity';
import HashStringShortenDynamic from 'ui/shared/HashStringShortenDynamic';

interface Props {
  data: Transaction | UtxoTransaction;
  isLoading?: boolean;
}

interface DetailRowProps {
  label: string;
  children: React.ReactNode;
}

const DetailRow = ({ label, children }: DetailRowProps) => {
  return (
    <Flex
      direction={{ base: 'column', lg: 'row' }}
      alignItems={{ base: 'stretch', lg: 'center' }}
      gap={ 2 }
      width="100%"
      minW={ 0 }
    >
      <Text fontWeight={ 500 } flexShrink={ 0 }>{ label }</Text>
      <Box minW={ 0 } width="100%" overflow="hidden">
        { children }
      </Box>
    </Flex>
  );
};

const formatUtxoDenomination = (denominationIndex: number) => {
  const denomination = denominations[denominationIndex];

  if (denomination === undefined) {
    return String(denominationIndex);
  }

  return `${ stripTrailingZeros(formatQi(denomination)) } Qi`;
};

const stripTrailingZeros = (value: string) => {
  return value
    .replace(/(\.\d*?[1-9])0+$/, '$1')
    .replace(/\.0+$/, '');
};

const TxUtxoInputs = ({ data, isLoading }: Props) => {
  if (!data.inputs) {
    return null;
  }

  return (
    <Box>
      { data.inputs.map((input, index) => {
        // Type-safe property access
        const previousOutPoint = input.PreviousOutPoint;
        const txHash = previousOutPoint?.TxHash;
        const indexValue = previousOutPoint?.Index;
        const pubKey = input.PubKey;

        // Runtime check for camelCase properties if PascalCase ones don't exist
        const camelCaseInput = input as unknown as {
          previousOutPoint?: { txHash?: string; index?: number };
          pubKey?: string;
        };

        if (!previousOutPoint || !txHash || indexValue === undefined || !pubKey) {
          // Try camelCase properties
          const camelCaseTxHash = camelCaseInput.previousOutPoint?.txHash;
          const camelCaseIndex = camelCaseInput.previousOutPoint?.index;
          const camelCasePubKey = camelCaseInput.pubKey;

          if (!camelCaseTxHash || camelCaseIndex === undefined || !camelCasePubKey) {
            return null;
          }

          return (
            <Box key={ index } mb={ 4 }>
              <Text fontWeight={ 500 } mb={ 2 }>Input #{ index + 1 }</Text>
              <Flex flexDir="column" gap={ 2 }>
                <DetailRow label="Previous Transaction:">
                  <TxEntity
                    hash={ camelCaseTxHash }
                    isLoading={ isLoading }
                    truncation="constant"
                    noIcon
                  />
                </DetailRow>
                <DetailRow label="Index:">
                  <Text>{ camelCaseIndex }</Text>
                </DetailRow>
                <DetailRow label="Public Key:">
                  <HashStringShortenDynamic hash={ camelCasePubKey }/>
                </DetailRow>
              </Flex>
            </Box>
          );
        }

        return (
          <Box key={ index } mb={ 4 }>
            <Text fontWeight={ 500 } mb={ 2 }>Input #{ index + 1 }</Text>
            <Flex flexDir="column" gap={ 2 }>
              <DetailRow label="Previous Transaction:">
                <TxEntity
                  hash={ txHash }
                  isLoading={ isLoading }
                  truncation="constant"
                  noIcon
                />
              </DetailRow>
              <DetailRow label="Index:">
                <Text>{ indexValue }</Text>
              </DetailRow>
              <DetailRow label="Public Key:">
                <HashStringShortenDynamic hash={ pubKey }/>
              </DetailRow>
            </Flex>
          </Box>
        );
      }) }
    </Box>
  );
};

const TxUtxoOutputs = ({ data, isLoading }: Props) => {
  if (!data.outputs) {
    return null;
  }

  return (
    <Box>
      { data.outputs.map((output, index) => {
        // Type-safe property access
        const address = output.Address;
        const denomination = output.Denomination;
        const lock = output.Lock;

        // Runtime check for camelCase properties if PascalCase ones don't exist
        const camelCaseOutput = output as unknown as {
          address?: string;
          denomination?: number;
          lock?: number;
        };

        if (!address || denomination === undefined || lock === undefined) {
          // Try camelCase properties
          const camelCaseAddress = camelCaseOutput.address;
          const camelCaseDenomination = camelCaseOutput.denomination;
          const camelCaseLock = camelCaseOutput.lock;

          if (!camelCaseAddress || camelCaseDenomination === undefined || camelCaseLock === undefined) {
            return null;
          }

          return (
            <Box key={ index } mb={ 4 }>
              <Text fontWeight={ 500 } mb={ 2 }>Output #{ index + 1 }</Text>
              <Flex flexDir="column" gap={ 2 }>
                <DetailRow label="Address:">
                  <AddressEntity
                    address={{ hash: camelCaseAddress }}
                    isLoading={ isLoading }
                    truncation="constant"
                  />
                </DetailRow>
                <DetailRow label="Denomination:">
                  <Text>{ formatUtxoDenomination(camelCaseDenomination) }</Text>
                </DetailRow>
                <DetailRow label="Lock:">
                  <Text>{ camelCaseLock }</Text>
                </DetailRow>
              </Flex>
            </Box>
          );
        }

        return (
          <Box key={ index } mb={ 4 }>
            <Text fontWeight={ 500 } mb={ 2 }>Output #{ index + 1 }</Text>
            <Flex flexDir="column" gap={ 2 }>
              <DetailRow label="Address:">
                <AddressEntity
                  address={{ hash: address }}
                  isLoading={ isLoading }
                  truncation="constant"
                />
              </DetailRow>
              <DetailRow label="Denomination:">
                <Text>{ formatUtxoDenomination(denomination) }</Text>
              </DetailRow>
              <DetailRow label="Lock:">
                <Text>{ lock }</Text>
              </DetailRow>
            </Flex>
          </Box>
        );
      }) }
    </Box>
  );
};

export { TxUtxoInputs, TxUtxoOutputs };
