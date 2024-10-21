import type { StyleProps } from '@chakra-ui/react';
import { Box, Image, useColorModeValue, Skeleton } from '@chakra-ui/react';
import React from 'react';

import { route } from 'nextjs-routes';

import config from 'configs/app';
import IconSvg from 'ui/shared/IconSvg';

interface Props {
  isCollapsed?: boolean;
  onClick?: (event: React.SyntheticEvent) => void;
  imageProps?: StyleProps;
}

const LogoFallback = ({
  isCollapsed,
  isSmall,
  imageProps,
}: {
  isCollapsed?: boolean;
  isSmall?: boolean;
  imageProps?: StyleProps;
}) => {
  const field = isSmall ? 'icon' : 'logo';
  const logoColor = useColorModeValue('blue.600', 'white');

  const display = isSmall ?
    {
      base: 'none',
      lg: isCollapsed === false ? 'none' : 'block',
      xl: isCollapsed ? 'block' : 'none',
    } :
    {
      base: 'block',
      lg: isCollapsed === false ? 'block' : 'none',
      xl: isCollapsed ? 'none' : 'block',
    };

  if (config.UI.sidebar[field].default) {
    return <Skeleton w="100%" borderRadius="sm" display={ display }/>;
  }

  return (
    <IconSvg
      name={ isSmall ? 'networks/icon-placeholder' : 'networks/logo-placeholder' }
      width="auto"
      height="100%"
      color={ logoColor }
      display={ display }
      { ...imageProps }
    />
  );
};

const NetworkLogo = ({ isCollapsed, onClick, imageProps }: Props) => {
  const logoSrc = useColorModeValue(
    config.UI.sidebar.logo.default,
    config.UI.sidebar.logo.dark || config.UI.sidebar.logo.default,
  );
  const iconSrc = useColorModeValue(
    config.UI.sidebar.icon.default,
    config.UI.sidebar.icon.dark || config.UI.sidebar.icon.default,
  );
  const darkModeFilter = { filter: 'brightness(0) invert(1)' };
  const logoStyle = useColorModeValue({}, !config.UI.sidebar.logo.dark ? darkModeFilter : {});
  const iconStyle = useColorModeValue({}, !config.UI.sidebar.icon.dark ? darkModeFilter : {});

  return (
    <Box
      as="a"
      href={ route({ pathname: '/' }) }
      width="100%"
      display="block"
      overflow="hidden"
      onClick={ onClick }
      aria-label="Link to main page"
    >
      { /* big logo */ }
      <Image
        src={ logoSrc }
        alt={ `${ config.chain.name } network logo` }
        fallback={ <LogoFallback isCollapsed={ isCollapsed } imageProps={ imageProps }/> }
        display={{ base: 'block', lg: isCollapsed === false ? 'block' : 'none', xl: isCollapsed ? 'none' : 'block' }}
        style={ logoStyle }
        { ...imageProps }
      />
      { /* small logo */ }
      <Image
        src={ iconSrc }
        alt={ `${ config.chain.name } network logo` }
        fallback={ <LogoFallback isCollapsed={ isCollapsed } imageProps={ imageProps } isSmall/> }
        display={{ base: 'none', lg: isCollapsed === false ? 'none' : 'block', xl: isCollapsed ? 'block' : 'none' }}
        style={ iconStyle }
        { ...imageProps }
      />
    </Box>
  );
};

export default React.memo(NetworkLogo);
