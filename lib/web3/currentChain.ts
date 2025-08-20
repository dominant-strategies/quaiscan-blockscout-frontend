import type { Chain } from 'wagmi/chains';

import config from 'configs/app';

type ChainConfig = Chain & {
  network: string;
  wrapped_Qi: string;
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
  wrapped_Qi: '0x002b2596EcF05C93a31ff916E8b456DF6C77c750',
  rpcUrls: {
    'public': {
      http: [ config.chain.rpcUrl ?? '' ],
    },
    'default': {
      http: [ config.chain.rpcUrl ?? '' ],
    },
    debug: {
      http: [ 'https://debug.rpc.quai.network' ],
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
