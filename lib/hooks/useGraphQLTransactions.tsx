import { useQuery } from '@tanstack/react-query';

import buildUrl from 'lib/api/buildUrl';

interface Transaction {
  hash: string;
  toAddressHash: string;
}

interface GraphQLResponse {
  data: {
    [key: string]: Transaction;
  };
}

export function useGraphQLTransactions(hashes: Array<string>) {
  return useQuery<Record<string, string>>({
    queryKey: [ 'graphql_transactions', hashes ],
    queryFn: async() => {
      if (!hashes.length) {
        return {};
      }

      // Create the GraphQL query with aliases for each hash
      const query = `{
        ${ hashes.map((hash, index) => `
          tx${ index }: transaction(hash: "${ hash }") {
            hash
            toAddressHash
          }
        `).join('\n') }
      }`;

      const response = await fetch(buildUrl('graphql'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transaction data');
      }

      const data = await response.json() as GraphQLResponse;

      // Transform the response into a map of hash -> toAddressHash
      return Object.values(data.data).reduce((acc, tx) => {
        acc[tx.hash] = tx.toAddressHash;
        return acc;
      }, {} as Record<string, string>);
    },
    enabled: hashes.length > 0,
  });
}
