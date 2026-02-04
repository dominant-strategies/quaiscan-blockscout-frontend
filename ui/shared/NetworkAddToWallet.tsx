import { Button } from '@chakra-ui/react';
import React from 'react';

import useToast from 'lib/hooks/useToast';
import * as mixpanel from 'lib/mixpanel/index';
import IconSvg from 'ui/shared/IconSvg';

// Wrapped QUAI token on Ethereum mainnet
const WRAPPED_QUAI_TOKEN = {
  address: '0x70b7f7044d2ca8e2f1e999b90ef16d7cb7a0cda1',
  symbol: 'WQUAI',
  decimals: 18,
  image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/22354.png',
};

const NetworkAddToWallet = () => {
  const toast = useToast();
  const [ hasEthereumWallet, setHasEthereumWallet ] = React.useState(false);

  React.useEffect(() => {
    // Check if user has an Ethereum wallet (MetaMask, etc.)
    setHasEthereumWallet(typeof window !== 'undefined' && 'ethereum' in window && Boolean(window.ethereum));
  }, []);

  const handleClick = React.useCallback(async() => {
    if (!window.ethereum) {
      toast({
        position: 'top-right',
        title: 'No wallet detected',
        description: 'Please install MetaMask or another Ethereum wallet',
        status: 'warning',
        variant: 'subtle',
        isClosable: true,
      });
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: WRAPPED_QUAI_TOKEN.address,
            symbol: WRAPPED_QUAI_TOKEN.symbol,
            decimals: WRAPPED_QUAI_TOKEN.decimals,
            image: WRAPPED_QUAI_TOKEN.image,
          },
        },
      });

      toast({
        position: 'top-right',
        title: 'Success',
        description: 'Wrapped QUAI token added to your wallet',
        status: 'success',
        variant: 'subtle',
        isClosable: true,
      });

      mixpanel.logEvent(mixpanel.EventTypes.ADD_TO_WALLET, {
        Target: 'token',
        Wallet: 'metamask',
        Token: WRAPPED_QUAI_TOKEN.symbol,
      });

    } catch (error) {
      toast({
        position: 'top-right',
        title: 'Error',
        description: (error as Error)?.message || 'Something went wrong',
        status: 'error',
        variant: 'subtle',
        isClosable: true,
      });
    }
  }, [ toast ]);

  if (!hasEthereumWallet) {
    return null;
  }

  return (
    <Button variant="outline" size="sm" onClick={ handleClick }>
      <IconSvg name="wallets/metamask" boxSize={ 5 } mr={ 2 }/>
        Add Wrapped QUAI
    </Button>
  );
};

export default React.memo(NetworkAddToWallet);
