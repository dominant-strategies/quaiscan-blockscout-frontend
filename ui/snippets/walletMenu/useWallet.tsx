import {
  useConnectModal,
} from '@rainbow-me/rainbowkit';
import { isQuaiAddress } from 'quais';
import React from 'react';
import { useAccount, useAccountEffect, useDisconnect } from 'wagmi';

import * as mixpanel from 'lib/mixpanel/index';

interface Params {
  source: mixpanel.EventPayload<mixpanel.EventTypes.WALLET_CONNECT>['Source'];
}

export default function useWallet({ source }: Params) {
  const { openConnectModal: open, connectModalOpen: isOpen } = useConnectModal();
  const { disconnect } = useDisconnect();
  const [ isModalOpening, setIsModalOpening ] = React.useState(false);
  const [ isClientLoaded, setIsClientLoaded ] = React.useState(false);
  const isConnectionStarted = React.useRef(false);

  React.useEffect(() => {
    setIsClientLoaded(true);
  }, []);

  const handleConnect = React.useCallback(async() => {
    setIsModalOpening(true);
    open!();
    setIsModalOpening(false);
    mixpanel.logEvent(mixpanel.EventTypes.WALLET_CONNECT, { Source: source, Status: 'Started' });
    isConnectionStarted.current = true;
  }, [ open, source ]);

  const handleAccountConnected = React.useCallback(({ isReconnected, address }: { isReconnected: boolean; address: string }) => {
    // Validate that the connected address is a valid Quai address on Cyprus-1 (starts with 0x00)
    if (address && (!isQuaiAddress(address) || !address.toLowerCase().startsWith('0x00'))) {
      // eslint-disable-next-line no-console
      console.warn('Connected wallet address is not a valid Quai address. Please use Pelagus wallet.');
      disconnect();
      return;
    }

    !isReconnected && isConnectionStarted.current &&
      mixpanel.logEvent(mixpanel.EventTypes.WALLET_CONNECT, { Source: source, Status: 'Connected' });
    isConnectionStarted.current = false;
  }, [ source, disconnect ]);

  const handleDisconnect = React.useCallback(() => {
    disconnect();
  }, [ disconnect ]);

  const { address, isDisconnected } = useAccount();

  useAccountEffect({ onConnect: handleAccountConnected });

  // Also check on render in case of reconnection (must be valid Quai address on Cyprus-1)
  const isValidQuaiAddress = address ? (isQuaiAddress(address) && address.toLowerCase().startsWith('0x00')) : true;
  const isWalletConnected = isClientLoaded && !isDisconnected && address !== undefined && isValidQuaiAddress;

  return {
    isWalletConnected,
    address: address || '',
    connect: handleConnect,
    disconnect: handleDisconnect,
    isModalOpening,
    isModalOpen: isOpen,
  };
}
