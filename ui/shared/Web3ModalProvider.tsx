import '@rainbow-me/rainbowkit/styles.css';

import { Center, Text, useColorMode } from '@chakra-ui/react';
import type {
  DisclaimerComponent } from '@rainbow-me/rainbowkit';
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from '@rainbow-me/rainbowkit';
import React from 'react';
import { WagmiProvider } from 'wagmi';

import { getFeaturePayload } from 'configs/app/features/types';

import config from 'configs/app';

const Disclaimer: DisclaimerComponent = () => {
  return (
    <Center>
      <Text fontSize="xs">QUAI Network Explorer</Text>
    </Center>
  );
};

const feature = config.features.blockchainInteraction;
const wagmiConfig = getFeaturePayload(feature)?.wagmiConfig;

interface Props {
  children: React.ReactNode;
  fallback?: JSX.Element | (() => JSX.Element);
}

const Fallback = ({ children, fallback }: Props) => {
  return typeof fallback === 'function' ?
    fallback() :
    fallback || <>{ children }</>; // eslint-disable-line react/jsx-no-useless-fragment
};

const Provider = ({ children, fallback }: Props) => {
  const { colorMode } = useColorMode();
  const [ theme, setTheme ] = React.useState(lightTheme());

  React.useEffect(() => {
    setTheme(colorMode === 'dark' ? darkTheme() : lightTheme());
  }, [ colorMode, setTheme ]);

  // not really necessary, but we have to make typescript happy
  if (!wagmiConfig || !feature.isEnabled) {
    return <Fallback fallback={ fallback }>{ children }</Fallback>;
  }

  return (
    <WagmiProvider config={ wagmiConfig }>
      <RainbowKitProvider
        appInfo={{
          appName: 'QUAISCAN',
          disclaimer: Disclaimer,
        }}
        modalSize="compact"
        theme={ theme }
      >
        { children }
      </RainbowKitProvider>
    </WagmiProvider>
  );
};

const Web3ModalProvider = wagmiConfig && feature.isEnabled ? Provider : Fallback;

export default Web3ModalProvider;
