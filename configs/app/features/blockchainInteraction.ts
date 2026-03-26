import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import type { Config } from 'wagmi';
import { createConfig, http } from 'wagmi';

import type { Feature } from './types';

import { pelagusWallet } from 'lib/web3/connectors/pelagus-connector';

import chain from '../chain';
import { getEnvValue } from '../utils';

const walletConnectProjectId = getEnvValue('NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID');

const title = 'Blockchain interaction (writing to contract, etc.)';

const config: Feature<{
  walletConnect: { projectId: string };
  wagmiConfig: Config | undefined;
}> = (() => {
  if (
    // all chain parameters are required for wagmi provider
    // @wagmi/chains/dist/index.d.ts
    chain.id &&
    chain.name &&
    chain.currency.name &&
    chain.currency.symbol &&
    chain.currency.decimals &&
    chain.rpcUrl &&
    walletConnectProjectId &&
    typeof connectorsForWallets === 'function'
  ) {
    const connectors = connectorsForWallets(
      [
        {
          groupName: 'Recommended',
          wallets: [ pelagusWallet ],
        },
      ],
      {
        appName: 'QUAI Explorer',
        projectId: walletConnectProjectId,
      },
    );

    const currentChain = {
      id: Number(chain.id),
      name: chain.name ?? '',
      network: chain.name ?? '',
      nativeCurrency: {
        decimals: chain.currency.decimals,
        name: chain.currency.name ?? '',
        symbol: chain.currency.symbol ?? '',
      },
      rpcUrls: {
        'public': {
          http: [ chain.rpcUrl ?? '' ],
        },
        'default': {
          http: [ chain.rpcUrl ?? '' ],
        },
      },
    };

    const wagmiConfig = createConfig({
      ssr: true,
      connectors,
      chains: [ currentChain ],
      transports: {
        [currentChain.id]: http(chain.rpcUrl || ''),
      },
    });

    return Object.freeze({
      title,
      isEnabled: true,
      wagmiConfig,
      walletConnect: {
        projectId: walletConnectProjectId,
      },
    });
  }

  return Object.freeze({
    title,
    isEnabled: false,
  });
})();

export default config;
