import type { Feature } from './types';

const title = 'Blockchain interaction (writing to contract, etc.)';

const config: Feature<{
  walletConnect: { projectId: string };
  wagmiConfig: undefined;
}> = Object.freeze({
  title,
  isEnabled: false,
});

export default config;
