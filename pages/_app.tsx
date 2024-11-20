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

const CookieBanner = ({ onAccept, onReject }: { onAccept: () => void; onReject: () => void }) => {
  const [ cookiesHandled, setCookiesHandled ] = useState(false);

  useEffect(() => {
    const storedConsent = localStorage.getItem('cookiesAccepted');
    if (storedConsent) {
      setCookiesHandled(true); // Hide banner if consent is already handled
    }
  }, []);

  const handleAccept = useCallback(() => {
    localStorage.setItem('cookiesAccepted', 'true');
    setCookiesHandled(true);
    onAccept();
  }, [ onAccept ]);

  const handleReject = useCallback(() => {
    localStorage.setItem('cookiesAccepted', 'false');
    setCookiesHandled(true);
    onReject();
  }, [ onReject ]);

  if (cookiesHandled) {
    return null; // Don't render the banner if consent is already handled
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #ddd',
        zIndex: 2000,
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                By clicking “Accept All Cookies,” you agree to the storing of cookies on your device to enhance site
                navigation, analyze site usage, and assist in our marketing efforts.
      </p>
      <div>
        <button
          onClick={ handleReject }
          style={{
            backgroundColor: '#e53935', // Red for reject
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            marginRight: '10px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
                    Reject All
        </button>
        <button
          onClick={ handleAccept }
          style={{
            backgroundColor: '#e53935', // Red for accept
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
                    Accept All Cookies
        </button>
      </div>
    </div>
  );
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  useLoadFeatures();
  useNotifyOnNavigation();

  const queryClient = useQueryClientConfig();
  const { shard } = useShards();

  const [ cookiesAccepted, setCookiesAccepted ] = useState<boolean | null>(null);
  const [ isReady, setIsReady ] = useState(false);

  useEffect(() => {
    const storedConsent = localStorage.getItem('cookiesAccepted');
    if (storedConsent === 'true') {
      setCookiesAccepted(true);
    } else if (storedConsent === 'false') {
      setCookiesAccepted(false);
    }
    setIsReady(true);
  }, []);

  const handleAcceptCookies = useCallback(() => {
    setCookiesAccepted(true);
  }, []);

  const handleRejectCookies = useCallback(() => {
    setCookiesAccepted(false);
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

  if (!isReady) {
    return null;
  }

  return (
    <ChakraProvider theme={ theme } cookies={ pageProps.cookies }>
      <AppErrorBoundary { ...ERROR_SCREEN_STYLES } onError={ handleError }>
        <QueryClientProvider client={ queryClient }>
          <Web3ModalProvider>
            <AppContextProvider pageProps={ pageProps }>
              <GrowthBookProvider growthbook={ growthBook }>
                <ScrollDirectionProvider>
                  <SocketProvider url={ wsUrl }>
                    { cookiesAccepted === null && (
                      <CookieBanner
                        onAccept={ handleAcceptCookies }
                        onReject={ handleRejectCookies }
                      />
                    ) }
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
