'use client';
import type { Wallet } from '@rainbow-me/rainbowkit';
import type { EIP1193Provider } from 'viem';
import { createConnector } from 'wagmi';
import { injected } from 'wagmi/connectors';

interface PelagusWindowProvider extends EIP1193Provider {
  isPelagus?: boolean;
  providerInfo?: {
    version: number;
  };
}

declare global {
  interface Window {
    pelagus?: PelagusWindowProvider;
  }
}

export const pelagusWallet = (): Wallet => ({
  id: 'pelagus',
  name: 'Pelagus Wallet',
  iconUrl: 'https://pelaguswallet.io/docs/img/PelagusLogoSquare.png',
  iconBackground: '#125ce8',
  downloadUrls: {
    chrome: 'https://chromewebstore.google.com/detail/pelagus/nhccebmfjcbhghphpclcfdkkekheegop',
  },
  extension: {
    instructions: {
      learnMoreUrl: 'https://chromewebstore.google.com/detail/pelagus/nhccebmfjcbhghphpclcfdkkekheegop',
      steps: [
        {
          description: 'We recommend using the Chrome browser. Click below to install the Pelagus Wallet extension.',
          step: 'install',
          title: 'Install the Pelagus Wallet Extension',
        },
        {
          description:
            'Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.',
          step: 'create',
          title: 'Create or Import a Wallet',
        },
        {
          description: 'Once you set up your wallet, click below to refresh the browser and load up the extension.',
          step: 'refresh',
          title: 'Refresh your browser',
        },
      ],
    },
  },
  createConnector: (walletDetails) => {
    return createConnector((config) => {
      return {
        ...injected({
          target: () => ({
            id: walletDetails.rkDetails.id,
            name: walletDetails.rkDetails.name,
            provider: (window) => {
              if (typeof window === 'undefined') {
                return undefined;
              }
              return (window as Window & { pelagus?: PelagusWindowProvider }).pelagus;
            },
          }),
        })(config),
        ...walletDetails,
      };
    });
  },
});
