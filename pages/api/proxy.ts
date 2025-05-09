import _pick from 'lodash/pick';
import _pickBy from 'lodash/pickBy';
import type { NextApiRequest, NextApiResponse } from 'next';

import fetchFactory from 'nextjs/utils/fetch';
import { httpLogger } from 'nextjs/utils/logger';

import appConfig from 'configs/app';

const handler = async(nextReq: NextApiRequest, nextRes: NextApiResponse) => {
  if (!nextReq.url) {
    nextRes.status(500).json({ error: 'no url provided' });
    return;
  }

  const url = new URL(
    nextReq.url.replace(/^\/node-api\/proxy/, ''),
    nextReq.headers['x-endpoint']?.toString() || appConfig.api.endpoint,
  );

  try {
    const apiRes = await fetchFactory(nextReq)(
      url.toString(),
      _pickBy(_pick(nextReq, [ 'body', 'method' ]), Boolean),
    );

    // Copy all headers from the API response
    apiRes.headers.forEach((value, key) => {
      nextRes.setHeader(key, value);
    });

    // Set CORS headers
    nextRes.setHeader('Access-Control-Allow-Origin', '*');
    nextRes.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    nextRes.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (nextReq.method === 'OPTIONS') {
      nextRes.status(200).end();
      return;
    }

    // Get the response body
    const body = await apiRes.text();

    // Log the response
    httpLogger.logger.info({
      message: 'API response',
      status: apiRes.status,
      body,
    });

    // Send the response
    nextRes.status(apiRes.status).send(body);
  } catch (error) {
    httpLogger.logger.error({
      message: 'Proxy error',
      error,
    });
    nextRes.status(500).json({ error: 'Proxy error' });
  }
};

export default handler;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
};
