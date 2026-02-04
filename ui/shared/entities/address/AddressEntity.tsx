import type { As } from '@chakra-ui/react';
import { Box, Flex, Skeleton, Tooltip, chakra, VStack, Tag, TagLabel } from '@chakra-ui/react';
import _omit from 'lodash/omit';
import React from 'react';

import type { AddressParam } from 'types/api/addressParams';

import { route } from 'nextjs-routes';

import { useAddressHighlightContext } from 'lib/contexts/addressHighlight';
import useResizeObserver from 'lib/hooks/useResizeObserver';
import useShards from 'lib/hooks/useShards';
import currentChain from 'lib/web3/currentChain';
import * as EntityBase from 'ui/shared/entities/base/components';
import IconSvg from 'ui/shared/IconSvg';

import { getIconProps } from '../base/utils';
import AddressIdenticon from './AddressIdenticon';

type LinkProps = EntityBase.LinkBaseProps & Pick<EntityProps, 'address'>;

const Link = chakra((props: LinkProps) => {
  const { extractShardIdFromAddress } = useShards();
  const shardId = extractShardIdFromAddress(props.address.hash);

  const defaultHref = route({
    pathname: '/address/[hash]',
    query: { ...props.query, hash: props.address.hash, shard: shardId },
  });

  return (
    <EntityBase.Link { ...props } href={ props.href ?? defaultHref }>
      { props.children }
    </EntityBase.Link>
  );
});

type IconProps = Pick<EntityProps, 'address' | 'isLoading' | 'iconSize' | 'noIcon' | 'isSafeAddress' | 'iconColor'> & {
  asProp?: As;
};

const Icon = (props: IconProps) => {
  if (props.noIcon) {
    return null;
  }

  const styles = {
    ...getIconProps(props.iconSize),
    marginRight: 2,
  };

  if (props.isLoading) {
    return <Skeleton { ...styles } borderRadius="full" flexShrink={ 0 }/>;
  }

  if (props.address.is_contract) {
    if (props.isSafeAddress) {
      return <EntityBase.Icon { ...props } name="brands/safe"/>;
    }

    if (props.address.is_verified) {
      return (
        <Tooltip label="Verified contract">
          <span>
            <EntityBase.Icon { ...props } name="contract_verified" color="green.500" borderRadius={ 0 }/>
          </span>
        </Tooltip>
      );
    }

    return (
      <Tooltip label="Contract">
        <span>
          <EntityBase.Icon { ...props } name="contract" borderRadius={ 0 }/>
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip label={ props.address.implementation_name }>
      <Flex marginRight={ styles.marginRight }>
        <AddressIdenticon size={ props.iconSize === 'lg' ? 30 : 20 } hash={ props.address.hash }/>
      </Flex>
    </Tooltip>
  );
};

type ContentProps = Omit<EntityBase.ContentBaseProps, 'text'> & Pick<EntityProps, 'address'>;

const Content = chakra((props: ContentProps) => {
  if (props.address.name || props.address.ens_domain_name) {
    const text = props.address.ens_domain_name || props.address.name;
    const label = (
      <VStack gap={ 0 } py={ 1 } color="inherit">
        <Box fontWeight={ 600 } whiteSpace="pre-wrap" wordBreak="break-word">
          { text }
        </Box>
        <Box whiteSpace="pre-wrap" wordBreak="break-word">
          { props.address.hash }
        </Box>
      </VStack>
    );

    return (
      <Tooltip label={ label } maxW={{ base: '100vw', lg: '400px' }}>
        <Skeleton isLoaded={ !props.isLoading } overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" as="span">
          { text }
        </Skeleton>
      </Tooltip>
    );
  }

  return <EntityBase.Content { ...props } text={ props.address.hash }/>;
});

type CopyProps = Omit<EntityBase.CopyBaseProps, 'text'> & Pick<EntityProps, 'address'>;

const Copy = (props: CopyProps) => {
  return <EntityBase.Copy { ...props } text={ props.address.hash }/>;
};

const Container = EntityBase.Container;

export interface EntityProps extends EntityBase.EntityBaseProps {
  address: Pick<
  AddressParam,
  'hash' | 'name' | 'is_contract' | 'is_verified' | 'implementation_name' | 'ens_domain_name'
  >;
  isSafeAddress?: boolean;
}

const AddressEntry = (props: EntityProps) => {
  const linkProps = _omit(props, [ 'className' ]);
  const partsProps = _omit(props, [ 'className', 'onClick' ]);
  const { extractShardIdFromAddress, shards } = useShards();
  const shardId = extractShardIdFromAddress(props.address.hash);
  const shard = shards[shardId];
  const [ parentRef, size ] = useResizeObserver();
  const context = useAddressHighlightContext();
  const verifiedTokenName = currentChain.verifiedTokens[props.address.hash];

  const windowWidth = typeof window !== 'undefined' && window.innerWidth ? window.innerWidth : 0;
  const addressTruncation = windowWidth > 764 && partsProps['truncation'] === undefined ? 'dynamic' : 'constant';
  partsProps['truncation'] = addressTruncation;

  return (
    <Container
      // we have to use the global classnames here, see theme/global.ts
      // otherwise, if we use sx prop, Chakra will generate the same styles for each instance of the component on the page
      className={ `${ props.className } address-entity ${ props.noCopy ? 'address-entity_no-copy' : '' }` }
      data-hash={ context && !props.isLoading ? props.address.hash : undefined }
      onMouseEnter={ context?.onMouseEnter }
      onMouseLeave={ context?.onMouseLeave }
      position="relative"
    >
      <Icon { ...partsProps }/>
      <Flex ref={ parentRef } display="inline-flex" alignItems="center" className="inline-block">
        <Link { ...linkProps }>
          <Content { ...partsProps }/>
        </Link>
        { size?.width && size?.width > 150 && shard && (
          <Tag ml={ 2 } whiteSpace="nowrap" size="sm" variant="outline" colorScheme="blue">
            <TagLabel lineHeight={ 2 }>{ shard.title }</TagLabel>
          </Tag>
        ) }
        { verifiedTokenName && !props.isLoading && (
          <Tooltip label={ `Verified token: ${ verifiedTokenName }` }>
            <chakra.span display="inline-flex" flexShrink={ 0 } alignItems="center">
              <IconSvg
                name="verified"
                boxSize={ 4 }
                color="green.500"
                ml={ 1 }
                cursor="pointer"
              />
            </chakra.span>
          </Tooltip>
        ) }
      </Flex>
      <Copy { ...partsProps }/>
    </Container>
  );
};

export default React.memo(chakra(AddressEntry));

export { Container, Link, Icon, Content, Copy };
