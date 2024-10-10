import type { AddressParam } from 'types/api/addressParams';

import config from 'configs/app';

export type TxCourseType = 'in' | 'out' | 'self' | 'unspecified';

export function getTxCourseType(from: string, to: string | undefined, current?: string): TxCourseType {
  if (current === undefined) {
    return 'unspecified';
  }

  if (to && from === to && from === current) {
    return 'self';
  }

  if (from === current) {
    return 'out';
  }

  if (to && to === current) {
    return 'in';
  }

  return 'unspecified';
}

export const unknownAddress: Omit<AddressParam, 'hash'> = {
  is_contract: false,
  is_verified: false,
  implementation_name: '',
  name: '',
  private_tags: [],
  public_tags: [],
  watchlist_names: [],
  ens_domain_name: null,
  currency: null,
};

export const getCurrencyFromAddress = (address: { currency: string | null }): string => {
  if (address.currency) {
    return `${ address.currency.charAt(0).toUpperCase() }${ address.currency.slice(1) }`;
  }

  const defaultCurrency = config.chain.currency.name as string;
  return `${ defaultCurrency.charAt(0).toUpperCase() }${ defaultCurrency.slice(1) }`;
};
