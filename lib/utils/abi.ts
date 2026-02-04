import { splitAuxdata, AuxdataStyle } from '@ethereum-sourcify/bytecode-utils';
import { arrayify } from '@ethersproject/bytes';
import bs58 from 'bs58';
import { decode } from 'cbor-x';
import type { FunctionFragment, Provider } from 'quais';
import { Interface, quais } from 'quais';

export const getABIFromAddress = async(address: string, provider: Provider, depth = 0): Promise<Array<any> | undefined> => {
  const ipfsUrl = 'https://ipfs.qu.ai';
  try {
    const resolvedAddress = quais.getAddress(address);
    const bytecode = await provider.getCode(resolvedAddress);
    if (bytecode === '0x' || bytecode === '0x0' || bytecode.length === 0) {
      throw new Error('No contract found at this address');
    }
    const metadataSections = await decodeMultipleMetadataSections(bytecode);
    if (metadataSections.length > 1) {
      console.warn(`Found ${ metadataSections.length } metadata sections for address ${ address }, using the first one`);
    } else if (metadataSections.length === 0) {
      // If no metadata is found, try to get the implementation from the bytecode (if it's a proxy)
      const impl = getImplementationFrom1167(bytecode);
      if (impl && depth < 5) {
        return getABIFromAddress(impl, provider, depth + 1); // recurse once
      }

      throw new Error('ABI not found (no metadata, not a proxy)');
    }
    const ipfsCid = metadataSections[0]?.ipfs;
    if (!ipfsCid) {
      throw new Error('No IPFS metadata found in bytecode');
    }
    // Fetch ABI from IPFS
    const url = `${ ipfsUrl }/ipfs/${ ipfsCid }`;
    const response = await fetch(url);
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Failed to fetch metadata: ${ response.statusText } (Status: ${ response.status })`);
    }
    const metadata = await response.json() as any;
    const parsedAbi = Interface.from(metadata.output.abi);

    // Check if this looks like a proxy ABI (has any proxy function)
    // OR if the ABI has no functions at all (some proxies only use fallback)
    const hasNoFunctions = !parsedAbi.fragments.some((f) => f.type === 'function');

    if (looksLikeTransparentProxyAbi(parsedAbi) || hasNoFunctions) {
      // Try to get the implementation from the EIP-1967 storage slot
      const impl = await getImplementationFrom1967(provider, resolvedAddress);
      if (impl && depth < 5) {
        return getABIFromAddress(impl, provider, depth + 1); // recurse once
      }
    }
    return metadata.output.abi; // Return the ABI
  } catch (e) {
    console.error(e);
  }
};

/**
 * If `code` is an EIP-1167 minimal-proxy return the embedded implementation
 * address, otherwise return `undefined`.
 */
export function getImplementationFrom1167(code: string): string | undefined {
  // minimal-proxy is always 45 bytes (0x2d) long
  const cleaned = code.replace(/^0x/, '').toLowerCase();
  if (cleaned.length !== 2 * 45) {
    return;
  }

  // opcode layout: … 36 3d 73 <20-byte-impl> 5a f4 3d 82 …
  const prefix = '363d3d373d3d3d363d73';
  const suffix = '5af43d82803e903d91602b57fd5bf3';

  if (!cleaned.startsWith(prefix) || !cleaned.endsWith(suffix)) {
    return;
  }

  const implHex = cleaned.slice(prefix.length, prefix.length + 40);
  return quais.getAddress('0x' + implHex); // checksums & validates
}

export const decodeMultipleMetadataSections = async(bytecode: string): Promise<Array<any>> => {

  if (!bytecode || bytecode.length === 0) {
    throw new Error('Bytecode cannot be empty');
  }

  const metadataSections = [];
  let remainingBytecode = bytecode;

  while (remainingBytecode.length > 0) {
    try {
      const [ executionBytecode, auxdata ] = splitAuxdata(remainingBytecode, AuxdataStyle.SOLIDITY);

      if (auxdata) {
        const decodedMetadata = decode(arrayify(`0x${ auxdata }`));
        metadataSections.push(decodedMetadata);
        remainingBytecode = executionBytecode ?? '';
      } else {
        break;
      }
    } catch (error: any) {
      console.error('Failed to decode metadata section:', error);
      break;
    }
  }

  return metadataSections.map((metadata) => ({
    ...metadata,
    ipfs: metadata.ipfs ? bs58.encode(metadata.ipfs) : undefined,
  }));
};

// Get the implementation address from a transparent proxy (EIP-1967)
async function getImplementationFrom1967(
  provider: Provider,
  proxy: string,
): Promise<string | undefined> {
  // bytes32(uint256(keccak256('eip1967.proxy.implementation'))-1)
  const slot =
      '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
  const raw = await provider.getStorage(proxy, slot);
  const addr = quais.getAddress('0x' + raw.slice(26)); // last 20 bytes
  if (addr === quais.ZeroAddress) {
    return;
  }
  // extra sanity: there must be *some* code at impl
  return (await provider.getCode(addr)) !== '0x' ? addr : undefined;
}

/**
 * Detects if an ABI looks like a proxy contract.
 *
 * Returns true if the ABI contains ANY known proxy function,
 * meaning we should check the EIP-1967 implementation slot.
 *
 * False positives are safe — if the slot is empty, we return the original ABI.
 */
function looksLikeTransparentProxyAbi(abi: Interface | undefined): boolean {
  if (!abi) {
    return false;
  }

  // Known proxy function names across various proxy patterns
  const PROXY_FUNCTIONS = new Set([
    // OpenZeppelin TransparentUpgradeableProxy
    'implementation',
    'upgradeTo',
    'upgradeToAndCall',
    'changeAdmin',
    // EIP-1967 beacon proxy
    'beacon',
    'setBeacon',
    // Gnosis Safe / other patterns
    'masterCopy',
    // EIP-2535 Diamond proxy
    'facets',
    'facetFunctionSelectors',
    'facetAddresses',
    'facetAddress',
    'diamondCut',
    // Common proxy helpers
    'proxyType',
    'proxyOwner',
    'pendingProxyOwner',
    'transferProxyOwnership',
    'claimProxyOwnership',
    'getImplementation',
    'getAdmin',
    'getBeacon',
  ]);

  // Get all function fragments
  const functions = abi.fragments.filter((f): f is FunctionFragment => f.type === 'function');

  // If the contract has ANY known proxy function, check the EIP-1967 slot
  return functions.some((fn) => PROXY_FUNCTIONS.has(fn.name));
}

export async function getAbiFromIpfsWithTimeout(
  address: string,
  provider: Provider,
  timeoutMs = 5_000, // max amount of time to wait for the ABI to be fetched from IPFS
): Promise<Array<any> | undefined> {
  const abort = new AbortController();

  const fetchPromise = getABIFromAddress(address, provider)
    .catch(() => undefined); // swallow all errors

  // A "sleep" that rejects after N ms
  const timer = new Promise<never>((_, rej) =>
    setTimeout(() => {
      abort.abort(); // cancel http request
      console.warn('ipfs-timeout');
      rej(new Error('ipfs-timeout'));
    }, timeoutMs),
  );

  // whichever settles first "wins"
  return Promise.race([ fetchPromise, timer ]).catch(() => undefined);
}
