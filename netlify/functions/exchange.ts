import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    const apiKey = process.env.EXCHANGE_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        } as Record<string, string>,
        body: JSON.stringify({ error: 'Exchange API key not configured' }),
      };
    }

    // 解析路径参数，例如 /exchange/latest/CNY
    const path = event.path.replace('/.netlify/functions/exchange', '');
    
    let exchangeUrl = `https://v6.exchangerate-api.com/v6/${apiKey}${path}`;
    
    console.log('Fetching exchange rates from:', exchangeUrl.replace(apiKey, '***'));
    
    const response = await fetch(exchangeUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'News-Stocks-Dashboard/1.0',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Exchange API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json',
      } as Record<string, string>,
      body: JSON.stringify(data),
    };
    
  } catch (error) {
    console.error('Exchange API error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      } as Record<string, string>,
      body: JSON.stringify({ 
        error: 'Failed to fetch exchange rates',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};