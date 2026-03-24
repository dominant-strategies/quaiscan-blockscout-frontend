import type { GridProps } from '@chakra-ui/react';
import { Box, Grid, Flex, Text, Link, VStack, Skeleton, useColorModeValue } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

import type { CustomLinksGroup } from 'types/footerLinks';

import config from 'configs/app';
import type { ResourceError } from 'lib/api/resources';
import useApiQuery from 'lib/api/useApiQuery';
import useFetch from 'lib/hooks/useFetch';
// import useIssueUrl from 'lib/hooks/useIssueUrl';
import IconSvg from 'ui/shared/IconSvg';
import NetworkAddToWallet from 'ui/shared/NetworkAddToWallet';

import FooterLinkItem from './FooterLinkItem';
import IntTxsIndexingStatus from './IntTxsIndexingStatus';
import getApiVersionUrl from './utils/getApiVersionUrl';

const MAX_LINKS_COLUMNS = 4;
const BLOCKSCOUT_URL = 'https://www.blockscout.com';
const BLOCKSCOUT_COPYRIGHT_START_YEAR = 2023;
const BLOCKSCOUT_BACKEND_REPO_URL = 'https://github.com/blockscout/blockscout';
const BLOCKSCOUT_FRONTEND_REPO_URL = 'https://github.com/blockscout/frontend';

const FRONT_VERSION_URL = `https://github.com/blockscout/frontend/tree/${ config.UI.footer.frontendVersion }`;
const FRONT_COMMIT_URL = `https://github.com/blockscout/frontend/commit/${ config.UI.footer.frontendCommit }`;

const Footer = () => {

  const { data: backendVersionData } = useApiQuery('config_backend_version', {
    queryOptions: {
      staleTime: Infinity,
    },
  });
  const apiVersionUrl = getApiVersionUrl(backendVersionData?.backend_version);
  // const issueUrl = useIssueUrl(backendVersionData?.backend_version);
  const BLOCKSCOUT_LINKS: any[] = [];
  const blockscoutLogoColor = useColorModeValue('blue.600', 'white');
  const currentYear = new Date().getFullYear();
  const copyrightYears = currentYear > BLOCKSCOUT_COPYRIGHT_START_YEAR ?
    `${ BLOCKSCOUT_COPYRIGHT_START_YEAR }-${ currentYear }` :
    String(BLOCKSCOUT_COPYRIGHT_START_YEAR);
  // const BLOCKSCOUT_LINKS = [
  //   {
  //     icon: 'edit' as const,
  //     iconSize: '16px',
  //     text: 'Submit an issue',
  //     url: issueUrl,
  //   },
  //   {
  //     icon: 'social/canny' as const,
  //     iconSize: '20px',
  //     text: 'Feature request',
  //     url: 'https://blockscout.canny.io/feature-requests',
  //   },
  //   {
  //     icon: 'social/git' as const,
  //     iconSize: '18px',
  //     text: 'Contribute',
  //     url: 'https://github.com/blockscout/blockscout',
  //   },
  //   {
  //     icon: 'social/tweet' as const,
  //     iconSize: '18px',
  //     text: 'Twitter',
  //     url: 'https://www.twitter.com/blockscoutcom',
  //   },
  //   {
  //     icon: 'social/discord' as const,
  //     iconSize: '24px',
  //     text: 'Discord',
  //     url: 'https://discord.gg/blockscout',
  //   },
  //   {
  //     icon: 'discussions' as const,
  //     iconSize: '20px',
  //     text: 'Discussions',
  //     url: 'https://github.com/orgs/blockscout/discussions',
  //   },
  //   {
  //     icon: 'donate' as const,
  //     iconSize: '20px',
  //     text: 'Donate',
  //     url: 'https://github.com/sponsors/blockscout',
  //   },
  // ];

  const backendLink = (
    <Link href={ apiVersionUrl || BLOCKSCOUT_BACKEND_REPO_URL } target="_blank" rel="noopener noreferrer">
      { backendVersionData?.backend_version || 'blockscout' }
    </Link>
  );

  const frontendLink = (() => {
    if (config.UI.footer.frontendVersion) {
      return (
        <Link href={ FRONT_VERSION_URL } target="_blank" rel="noopener noreferrer">
          { config.UI.footer.frontendVersion }
        </Link>
      );
    }

    if (config.UI.footer.frontendCommit) {
      return (
        <Link href={ FRONT_COMMIT_URL } target="_blank" rel="noopener noreferrer">
          { config.UI.footer.frontendCommit }
        </Link>
      );
    }

    return (
      <Link href={ BLOCKSCOUT_FRONTEND_REPO_URL } target="_blank" rel="noopener noreferrer">
        frontend
      </Link>
    );
  })();

  const fetch = useFetch();

  const { isPlaceholderData, data: linksData } = useQuery<unknown, ResourceError<unknown>, Array<CustomLinksGroup>>({
    queryKey: [ 'footer-links' ],
    queryFn: async() => fetch(config.UI.footer.links || '', undefined, { resource: 'footer-links' }),
    enabled: Boolean(config.UI.footer.links),
    staleTime: Infinity,
    placeholderData: [],
  });

  const colNum = isPlaceholderData ? 1 : Math.min(linksData?.length || Infinity, MAX_LINKS_COLUMNS) + 1;

  const renderNetworkInfo = React.useCallback((gridArea?: GridProps['gridArea']) => {
    return (
      <Flex
        gridArea={ gridArea }
        flexWrap="wrap"
        columnGap={ 8 }
        rowGap={ 6 }
        mb={{ base: 5, lg: 10 }}
        _empty={{ display: 'none' }}
      >
        { !config.UI.indexingAlert.intTxs.isHidden && <IntTxsIndexingStatus/> }
        <NetworkAddToWallet/>
      </Flex>
    );
  }, []);

  const renderProjectInfo = React.useCallback((gridArea?: GridProps['gridArea']) => {
    return (
      <VStack gridArea={ gridArea } spacing={ 6 } alignItems="start">
        <Box>
          <Link fontSize="xs" href="https://quaiscan.io">quaiscan.io</Link>
          <Text mt={ 3 } fontSize="xs" color="text_secondary">
            Quaiscan is a tool for inspecting and analyzing Quai network.
          </Text>
        </Box>

        <Box>
          <Flex flexWrap="wrap" alignItems="center" columnGap={ 2 } rowGap={ 2 }>
            <Text fontSize="xs" color="text_secondary">Made with</Text>
            <Link
              href={ BLOCKSCOUT_URL }
              target="_blank"
              rel="noopener noreferrer"
              display="inline-flex"
              alignItems="center"
              aria-label="Blockscout"
            >
              <IconSvg
                name="networks/logo-placeholder"
                width="101px"
                height="20px"
                color={ blockscoutLogoColor }
              />
            </Link>
          </Flex>

          <VStack spacing={ 1 } mt={ 3 } alignItems="start">
            <Text fontSize="xs" color="text_secondary">
              Backend: { backendLink }
            </Text>
            <Text fontSize="xs" color="text_secondary">
              Frontend: { frontendLink }
            </Text>
            <Text fontSize="xs" color="text_secondary">
              Copyright © Blockscout Limited { copyrightYears }
            </Text>
          </VStack>
        </Box>
      </VStack>
    );
  }, [ backendLink, blockscoutLogoColor, copyrightYears, frontendLink ]);

  const containerProps: GridProps = {
    as: 'footer',
    px: { base: 4, lg: 12 },
    py: { base: 4, lg: 9 },
    borderTop: '1px solid',
    borderColor: 'divider',
    gridTemplateColumns: { base: '1fr', lg: 'minmax(auto, 470px) 1fr' },
    columnGap: { lg: '32px', xl: '100px' },
  };

  if (config.UI.footer.links) {
    return (
      <Grid { ...containerProps }>
        <div>
          { renderNetworkInfo() }
          { renderProjectInfo() }
        </div>

        <Grid
          gap={{ base: 6, lg: colNum === MAX_LINKS_COLUMNS + 1 ? 2 : 8, xl: 12 }}
          gridTemplateColumns={{
            base: 'repeat(auto-fill, 160px)',
            lg: `repeat(${ colNum }, 135px)`,
            xl: `repeat(${ colNum }, 160px)`,
          }}
          justifyContent={{ lg: 'flex-end' }}
          mt={{ base: 8, lg: 0 }}
        >
          {
            ([
              { title: 'Quaiscan', links: BLOCKSCOUT_LINKS },
              ...(linksData || []),
            ])
              .slice(0, colNum)
              .map(linkGroup => (
                <Box key={ linkGroup.title }>
                  <Skeleton fontWeight={ 500 } mb={ 3 } display="inline-block" isLoaded={ !isPlaceholderData }>{ linkGroup.title }</Skeleton>
                  <VStack spacing={ 1 } alignItems="start">
                    { linkGroup.links.map(link => <FooterLinkItem { ...link } key={ link.text } isLoading={ isPlaceholderData }/>) }
                  </VStack>
                </Box>
              ))
          }
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid
      { ...containerProps }
      gridTemplateAreas={{
        lg: `
          "network links-top"
          "info links-bottom"
        `,
      }}
    >

      { renderNetworkInfo({ lg: 'network' }) }
      { renderProjectInfo({ lg: 'info' }) }

      <Grid
        gridArea={{ lg: 'links-bottom' }}
        gap={ 1 }
        gridTemplateColumns={{
          base: 'repeat(auto-fill, 160px)',
          lg: 'repeat(3, 160px)',
          xl: 'repeat(4, 160px)',
        }}
        gridTemplateRows={{
          base: 'auto',
          lg: 'repeat(3, auto)',
          xl: 'repeat(2, auto)',
        }}
        gridAutoFlow={{ base: 'row', lg: 'column' }}
        alignContent="start"
        justifyContent={{ lg: 'flex-end' }}
        mt={{ base: 8, lg: 0 }}
      >
        { BLOCKSCOUT_LINKS.map(link => <FooterLinkItem { ...link } key={ link.text }/>) }
      </Grid>
    </Grid>
  );
};

export default React.memo(Footer);
