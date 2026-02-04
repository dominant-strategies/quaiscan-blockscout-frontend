import type { Chain } from 'wagmi/chains';

import config from 'configs/app';

type ChainConfig = Chain & {
  network: string;
  wrapped_Qi: string;
  verifiedTokens: Record<string, string>; // address -> label
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
  verifiedTokens: {
    '0x0049F7cbCa3556C2DfaE62Aafa7015F99de1b8f5': 'Symbiosis Wrapped USDT',
    '0x003d9F9666853fD4A10351FF5364c602470A7cF6': 'Symbiosis Portal',
    '0x003d4d57930b2E0887606bE461ab167CAC2E769e': 'Symbiosis Bridge',
    '0x006C3e2AaAE5DB1bCd11A1a097cE572312EADdBB': 'Wrapped QUAI',
    '0x006432Ea8c46cBF981f6e710d2439C941CeBe2d0': 'Quaiswap Router',
  },
  rpcUrls: {
    'public': {
      http: [ config.chain.rpcUrl ?? '' ],
    },
    'default': {
      http: [ config.chain.rpcUrl ?? '' ],
    },
    debug: {
      http: [ config.chain.debugRpcUrl ?? 'https://debug.rpc.quai.network' ],
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
