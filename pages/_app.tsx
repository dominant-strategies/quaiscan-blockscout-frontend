import type { ChakraProps } from '@chakra-ui/react';
import { GrowthBookProvider } from '@growthbook/growthbook-react';
import * as Sentry from '@sentry/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { AppProps } from 'next/dist/shared/lib/router/router';
import React, { useState, useEffect, useCallback } from 'react';

import type { NextPageWithLayout } from 'nextjs/types';

import config from 'configs/app';
import useQueryClientConfig from 'lib/api/useQueryClientConfig';
import { AppContextProvider } from 'lib/contexts/app';
import { ChakraProvider } from 'lib/contexts/chakra';
import { ScrollDirectionProvider } from 'lib/contexts/scrollDirection';
import { growthBook } from 'lib/growthbook/init';
import useLoadFeatures from 'lib/growthbook/useLoadFeatures';
import useNotifyOnNavigation from 'lib/hooks/useNotifyOnNavigation';
import useShards from 'lib/hooks/useShards';
import { SocketProvider } from 'lib/socket/context';
import theme from 'theme';
import AppErrorBoundary from 'ui/shared/AppError/AppErrorBoundary';
import GoogleAnalytics from 'ui/shared/GoogleAnalytics';
import Layout from 'ui/shared/layout/Layout';
import Web3ModalProvider from 'ui/shared/Web3ModalProvider';

import 'lib/setLocale';
// import 'focus-visible/dist/focus-visible';

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const ERROR_SCREEN_STYLES: ChakraProps = {
  h: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  width: 'fit-content',
  maxW: '800px',
  margin: '0 auto',
  p: { base: 4, lg: 0 },
};

const CookieBanner = ({ onAccept }: { onAccept: () => void }) => {
  const [ cookiesAccepted, setCookiesAccepted ] = useState(false);

  useEffect(() => {
    const storedConsent = localStorage.getItem('cookiesAccepted');
    if (storedConsent) {
      setCookiesAccepted(storedConsent === 'true');
    }
  }, []);

  const handleAccept = useCallback(() => {
    localStorage.setItem('cookiesAccepted', 'true');
    setCookiesAccepted(true);
    onAccept();
  }, [ onAccept ]);

  if (cookiesAccepted) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        backgroundColor: '#000',
        color: '#fff',
        width: '100%',
        padding: '10px',
        zIndex: 1000,
      }}
    >
      <p>
          We use cookies to enhance your experience. By continuing to visit this site, you accept our use of cookies.{ ' ' }
        <button onClick={ handleAccept }>Accept</button>
      </p>
    </div>
  );
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  useLoadFeatures();
  useNotifyOnNavigation();

  const queryClient = useQueryClientConfig();
  const { shard } = useShards();

  const [ cookiesAccepted, setCookiesAccepted ] = useState(false);

  useEffect(() => {
    const storedConsent = localStorage.getItem('cookiesAccepted');
    if (storedConsent === 'true') {
      setCookiesAccepted(true);
    }
  }, []);

  const handleAcceptCookies = useCallback(() => {
    setCookiesAccepted(true);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    Sentry.captureException(error);
  }, []);

  const getLayout = Component.getLayout ?? ((page) => <Layout>{ page }</Layout>);

  const wsUrl = React.useMemo(() => {
    const url = new URL(`${ config.api.socket }${ config.api.basePath }/socket/v2`);
    const shardHost = shard?.apiHost;
    if (shardHost) {
      // Replace host
      url.host = shardHost;
    }

    return url.toString();
  }, [ shard ]);

  return (
    <ChakraProvider theme={ theme } cookies={ pageProps.cookies }>
      <AppErrorBoundary { ...ERROR_SCREEN_STYLES } onError={ handleError }>
        <QueryClientProvider client={ queryClient }>
          <Web3ModalProvider>
            <AppContextProvider pageProps={ pageProps }>
              <GrowthBookProvider growthbook={ growthBook }>
                <ScrollDirectionProvider>
                  <SocketProvider url={ wsUrl }>
                    <CookieBanner onAccept={ handleAcceptCookies }/>
                    { getLayout(<Component { ...pageProps }/>) }
                  </SocketProvider>
                </ScrollDirectionProvider>
              </GrowthBookProvider>
              <ReactQueryDevtools
                buttonPosition="bottom-left"
                position="left"
              />
              { cookiesAccepted && <GoogleAnalytics/> }
            </AppContextProvider>
          </Web3ModalProvider>
        </QueryClientProvider>
      </AppErrorBoundary>
    </ChakraProvider>
  );
}

export default MyApp;
