import { Box, Flex, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { denominations, formatQi } from 'quais';
import React from 'react';

import type { Transaction, UtxoTransaction } from 'types/api/transaction';

import CopyToClipboard from 'ui/shared/CopyToClipboard';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import TxEntity from 'ui/shared/entities/tx/TxEntity';
import HashStringShorten from 'ui/shared/HashStringShorten';

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

const parseNumericValue = (value: number | string | undefined) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  if (value.startsWith('0x') || value.startsWith('0X')) {
    const parsedHex = Number.parseInt(value, 16);
    return Number.isNaN(parsedHex) ? undefined : parsedHex;
  }

  const parsedNumber = Number.parseInt(value, 10);
  return Number.isNaN(parsedNumber) ? undefined : parsedNumber;
};

const formatUtxoDenomination = (denominationIndex: number | string) => {
  const normalizedIndex = parseNumericValue(denominationIndex);

  if (normalizedIndex === undefined) {
    return String(denominationIndex);
  }

  const denomination = denominations[normalizedIndex];

  if (denomination === undefined) {
    return String(denominationIndex);
  }

  const denominationQit = Number(denomination);
  const denominationQi = stripTrailingZeros(formatQi(denomination));
  const qitLabel = `${ numberFormat.format(denominationQit) } ${ denominationQit === 1 ? 'Qit' : 'Qits' }`;

  return `${ denominationQi } Qi (${ qitLabel })`;
};

const stripTrailingZeros = (value: string) => {
  return value
    .replace(/(\.\d*?[1-9])0+$/, '$1')
    .replace(/\.0+$/, '');
};

const numberFormat = new Intl.NumberFormat('en-US');

const PubKeyValue = ({ value }: { value: string }) => {
  return (
    <Flex alignItems="center" minW={ 0 } width="100%">
      <Box overflow="hidden" minW={ 0 }>
        <HashStringShorten hash={ value } type="long"/>
      </Box>
      <CopyToClipboard text={ value }/>
    </Flex>
  );
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
                  <PubKeyValue value={ camelCasePubKey }/>
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
                <PubKeyValue value={ pubKey }/>
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

  const outputs = data.outputs.flatMap((output) => {
    const address = output.Address;
    const denomination = parseNumericValue(output.Denomination as number | string | undefined);
    const lock = parseNumericValue(output.Lock as number | string | undefined);

    const camelCaseOutput = output as unknown as {
      address?: string;
      denomination?: number | string;
      lock?: number | string;
    };

    if (address && denomination !== undefined && lock !== undefined) {
      return [ { address, denomination, lock } ];
    }

    const camelCaseAddress = camelCaseOutput.address;
    const camelCaseDenomination = parseNumericValue(camelCaseOutput.denomination);
    const camelCaseLock = parseNumericValue(camelCaseOutput.lock);

    if (camelCaseAddress && camelCaseDenomination !== undefined && camelCaseLock !== undefined) {
      return [ { address: camelCaseAddress, denomination: camelCaseDenomination, lock: camelCaseLock } ];
    }

    return [];
  });

  return (
    <>
      <Box display={{ base: 'block', lg: 'none' }} width="100%">
        <Flex direction="column" gap={ 3 } width="100%">
          { outputs.map((output, index) => (
            <Box
              key={ `${ output.address }-${ index }` }
              borderWidth="1px"
              borderColor="gray.200"
              borderRadius="md"
              p={ 3 }
            >
              <Text fontWeight={ 600 } mb={ 3 }>Output #{ index + 1 }</Text>
              <Flex direction="column" gap={ 2 }>
                <DetailRow label="Address:">
                  <AddressEntity
                    address={{ hash: output.address }}
                    isLoading={ isLoading }
                    truncation="constant"
                  />
                </DetailRow>
                <DetailRow label="Denomination:">
                  <Text whiteSpace="normal">{ formatUtxoDenomination(output.denomination) }</Text>
                </DetailRow>
                <DetailRow label="Lock:">
                  <Text>{ output.lock }</Text>
                </DetailRow>
              </Flex>
            </Box>
          )) }
        </Flex>
      </Box>

      <TableContainer
        display={{ base: 'none', lg: 'block' }}
        width="fit-content"
        maxW="100%"
        overflowX="auto"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="md"
      >
        <Table size="sm" variant="simple" width="auto" minW="640px">
          <Thead>
            <Tr>
              <Th w="72px" px={ 3 }>Output</Th>
              <Th px={ 3 }>Address</Th>
              <Th w="180px" px={ 3 }>Denomination</Th>
              <Th w="80px" px={ 3 }>Lock</Th>
            </Tr>
          </Thead>
          <Tbody>
            { outputs.map((output, index) => (
              <Tr key={ `${ output.address }-${ index }` }>
                <Td whiteSpace="nowrap" fontWeight={ 500 } px={ 3 }>#{ index + 1 }</Td>
                <Td px={ 3 }>
                  <Box minW={ 0 }>
                    <AddressEntity
                      address={{ hash: output.address }}
                      isLoading={ isLoading }
                      truncation="constant"
                    />
                  </Box>
                </Td>
                <Td whiteSpace="nowrap" px={ 3 }>{ formatUtxoDenomination(output.denomination) }</Td>
                <Td whiteSpace="nowrap" px={ 3 }>{ output.lock }</Td>
              </Tr>
            )) }
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
};

export { TxUtxoInputs, TxUtxoOutputs };
