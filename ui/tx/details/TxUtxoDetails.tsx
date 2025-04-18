import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';

import type { UtxoTransaction } from 'types/api/transaction';

import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import TxEntity from 'ui/shared/entities/tx/TxEntity';
import HashStringShortenDynamic from 'ui/shared/HashStringShortenDynamic';

interface Props {
  data: UtxoTransaction;
  isLoading?: boolean;
}

const TxUtxoInputs = ({ data, isLoading }: Props) => {
  return (
    <Box>
      { data.inputs.map((input, index) => (
        <Box key={ index } mb={ 4 }>
          <Text fontWeight={ 500 } mb={ 2 }>Input #{ index + 1 }</Text>
          <Flex flexDir="column" gap={ 2 }>
            <Flex alignItems="center" gap={ 2 }>
              <Text fontWeight={ 500 }>Previous Transaction:</Text>
              <TxEntity
                hash={ input.previousOutPoint.txHash }
                isLoading={ isLoading }
                truncation="constant"
                noIcon
              />
            </Flex>
            <Flex alignItems="center" gap={ 2 }>
              <Text fontWeight={ 500 }>Index:</Text>
              <Text>{ input.previousOutPoint.index }</Text>
            </Flex>
            <Flex alignItems="center" gap={ 2 }>
              <Text fontWeight={ 500 }>Public Key:</Text>
              <HashStringShortenDynamic hash={ input.pubKey }/>
            </Flex>
          </Flex>
        </Box>
      )) }
    </Box>
  );
};

const TxUtxoOutputs = ({ data, isLoading }: Props) => {
  return (
    <Box>
      { data.outputs.map((output, index) => (
        <Box key={ index } mb={ 4 }>
          <Text fontWeight={ 500 } mb={ 2 }>Output #{ index + 1 }</Text>
          <Flex flexDir="column" gap={ 2 }>
            <Flex alignItems="center" gap={ 2 }>
              <Text fontWeight={ 500 }>Address:</Text>
              <AddressEntity
                address={{ hash: output.address }}
                isLoading={ isLoading }
                truncation="constant"
              />
            </Flex>
            <Flex alignItems="center" gap={ 2 }>
              <Text fontWeight={ 500 }>Denomination:</Text>
              <Text>{ output.denomination }</Text>
            </Flex>
            <Flex alignItems="center" gap={ 2 }>
              <Text fontWeight={ 500 }>Lock:</Text>
              <Text>{ output.lock }</Text>
            </Flex>
          </Flex>
        </Box>
      )) }
    </Box>
  );
};

export { TxUtxoInputs, TxUtxoOutputs }; 