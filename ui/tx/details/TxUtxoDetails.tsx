import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';

import type { Transaction, UtxoTransaction } from 'types/api/transaction';

import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import TxEntity from 'ui/shared/entities/tx/TxEntity';
import HashStringShortenDynamic from 'ui/shared/HashStringShortenDynamic';

interface Props {
  data: Transaction | UtxoTransaction;
  isLoading?: boolean;
}

// Type guard to check if an object has a property
function hasProperty<T extends object, K extends string>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj;
}

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
                <Flex alignItems="center" gap={ 2 }>
                  <Text fontWeight={ 500 }>Previous Transaction:</Text>
                  <TxEntity
                    hash={ camelCaseTxHash }
                    isLoading={ isLoading }
                    truncation="constant"
                    noIcon
                  />
                </Flex>
                <Flex alignItems="center" gap={ 2 }>
                  <Text fontWeight={ 500 }>Index:</Text>
                  <Text>{ camelCaseIndex }</Text>
                </Flex>
                <Flex alignItems="center" gap={ 2 }>
                  <Text fontWeight={ 500 }>Public Key:</Text>
                  <HashStringShortenDynamic hash={ camelCasePubKey }/>
                </Flex>
              </Flex>
            </Box>
          );
        }

        return (
          <Box key={ index } mb={ 4 }>
            <Text fontWeight={ 500 } mb={ 2 }>Input #{ index + 1 }</Text>
            <Flex flexDir="column" gap={ 2 }>
              <Flex alignItems="center" gap={ 2 }>
                <Text fontWeight={ 500 }>Previous Transaction:</Text>
                <TxEntity
                  hash={ txHash }
                  isLoading={ isLoading }
                  truncation="constant"
                  noIcon
                />
              </Flex>
              <Flex alignItems="center" gap={ 2 }>
                <Text fontWeight={ 500 }>Index:</Text>
                <Text>{ indexValue }</Text>
              </Flex>
              <Flex alignItems="center" gap={ 2 }>
                <Text fontWeight={ 500 }>Public Key:</Text>
                <HashStringShortenDynamic hash={ pubKey }/>
              </Flex>
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
                <Flex alignItems="center" gap={ 2 }>
                  <Text fontWeight={ 500 }>Address:</Text>
                  <AddressEntity
                    address={{ hash: camelCaseAddress }}
                    isLoading={ isLoading }
                    truncation="constant"
                  />
                </Flex>
                <Flex alignItems="center" gap={ 2 }>
                  <Text fontWeight={ 500 }>Denomination:</Text>
                  <Text>{ camelCaseDenomination }</Text>
                </Flex>
                <Flex alignItems="center" gap={ 2 }>
                  <Text fontWeight={ 500 }>Lock:</Text>
                  <Text>{ camelCaseLock }</Text>
                </Flex>
              </Flex>
            </Box>
          );
        }

        return (
          <Box key={ index } mb={ 4 }>
            <Text fontWeight={ 500 } mb={ 2 }>Output #{ index + 1 }</Text>
            <Flex flexDir="column" gap={ 2 }>
              <Flex alignItems="center" gap={ 2 }>
                <Text fontWeight={ 500 }>Address:</Text>
                <AddressEntity
                  address={{ hash: address }}
                  isLoading={ isLoading }
                  truncation="constant"
                />
              </Flex>
              <Flex alignItems="center" gap={ 2 }>
                <Text fontWeight={ 500 }>Denomination:</Text>
                <Text>{ denomination }</Text>
              </Flex>
              <Flex alignItems="center" gap={ 2 }>
                <Text fontWeight={ 500 }>Lock:</Text>
                <Text>{ lock }</Text>
              </Flex>
            </Flex>
          </Box>
        );
      }) }
    </Box>
  );
};

export { TxUtxoInputs, TxUtxoOutputs }; 