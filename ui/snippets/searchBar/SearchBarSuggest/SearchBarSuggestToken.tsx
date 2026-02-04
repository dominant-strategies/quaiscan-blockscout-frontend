import { Grid, Text, Flex } from '@chakra-ui/react';
import React from 'react';

import type { SearchResultToken } from 'types/api/search';

import highlightText from 'lib/highlightText';
import currentChain from 'lib/web3/currentChain';
import * as TokenEntity from 'ui/shared/entities/token/TokenEntity';
import HashStringShortenDynamic from 'ui/shared/HashStringShortenDynamic';
import IconSvg from 'ui/shared/IconSvg';

interface Props {
  data: SearchResultToken;
  isMobile: boolean | undefined;
  searchTerm: string;
}

const SearchBarSuggestToken = ({ data, isMobile, searchTerm }: Props) => {
  const icon = <TokenEntity.Icon token={{ ...data, type: data.token_type }}/>;
  const isVerified = data.is_verified_via_admin_panel || currentChain.verifiedTokens[data.address];
  const verifiedLabel = currentChain.verifiedTokens[data.address];
  const verifiedIcon = (
    <>
      <IconSvg name="verified_token" boxSize={ 4 } color="green.500" ml={ 1 }/>
      { verifiedLabel && <Text ml={ 1 } fontSize="sm" color="green.500">{ verifiedLabel }</Text> }
    </>
  );
  const name = (
    <Text
      fontWeight={ 700 }
      overflow="hidden"
      whiteSpace="nowrap"
      textOverflow="ellipsis"
    >
      <span dangerouslySetInnerHTML={{ __html: highlightText(data.name + (data.symbol ? ` (${ data.symbol })` : ''), searchTerm) }}/>
    </Text>
  );

  const address = (
    <Text variant="secondary" whiteSpace="nowrap" overflow="hidden">
      <HashStringShortenDynamic hash={ data.address } isTooltipDisabled/>
    </Text>
  );

  const contractVerifiedIcon = data.is_smart_contract_verified && <IconSvg name="status/success" boxSize="14px" color="green.500" ml={ 1 } flexShrink={ 0 }/>;
  const additionalInfo = (
    <Text overflow="hidden" whiteSpace="nowrap" fontWeight={ 700 }>
      { data.token_type === 'ERC-20' && data.exchange_rate && `$${ Number(data.exchange_rate).toLocaleString() }` }
      { data.token_type !== 'ERC-20' && data.total_supply && `Items ${ Number(data.total_supply).toLocaleString() }` }
    </Text>
  );

  if (isMobile) {
    const templateCols = `1fr
    ${ (data.token_type === 'ERC-20' && data.exchange_rate) || (data.token_type !== 'ERC-20' && data.total_supply) ? ' auto' : '' }`;

    return (
      <>
        <Flex alignItems="center">
          { icon }
          { name }
          { isVerified && verifiedIcon }
        </Flex>
        <Grid templateColumns={ templateCols } alignItems="center" gap={ 2 }>
          <Flex alignItems="center" overflow="hidden">
            { address }
            { contractVerifiedIcon }
          </Flex>
          { additionalInfo }
        </Grid>
      </>
    );
  }

  return (
    <Grid templateColumns="minmax(228px, 400px) 1fr auto" gap={ 2 }>
      <Flex alignItems="center" minW={ 0 }>
        { icon }
        { name }
        { isVerified && (
          <Flex alignItems="center" flexShrink={ 0 }>
            <IconSvg name="verified_token" boxSize={ 4 } color="green.500" ml={ 1 }/>
            { verifiedLabel && <Text ml={ 1 } fontSize="sm" color="green.500" whiteSpace="nowrap">{ verifiedLabel }</Text> }
          </Flex>
        ) }
      </Flex>
      <Flex alignItems="center" overflow="hidden">
        { address }
        { contractVerifiedIcon }
      </Flex>
      { additionalInfo }
    </Grid>
  );
};

export default React.memo(SearchBarSuggestToken);
