import type { Chain } from 'wagmi/chains';

import config from 'configs/app';

type ChainConfig = Chain & {
  network: string;
};

const currentChain: ChainConfig = {
  id: Number(config.chain.id),
  name: config.chain.name ?? '',
  network: config.chain.name ?? '',
  nativeCurrency: {
    decimals: config.chain.currency.decimals,
    name: config.chain.currency.name ?? '',
    symbol: config.chain.currency.symbol ?? '',
  },
  rpcUrls: {
    'public': {
      http: [ config.chain.rpcUrl ?? '' ],
    },
    'default': {
      http: [ config.chain.rpcUrl ?? '' ],
    },
  },
  blockExplorers: {
    'default': {
      name: 'Quaiscan',
      url: config.app.baseUrl,
    },
  },
};

export default currentChain;
