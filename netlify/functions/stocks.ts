import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    const apiToken = process.env.TIINGO_API_TOKEN;
    
    if (!apiToken) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        } as Record<string, string>,
        body: JSON.stringify({ error: 'Tiingo API token not configured' }),
      };
    }

    // 处理 OPTIONS 预检请求
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        } as Record<string, string>,
        body: '',
      };
    }

    // 解析路径参数，例如 /stocks/daily/SPY/prices
    const path = event.path.replace('/.netlify/functions/stocks', '');
    const { startDate, endDate, resampleFreq } = event.queryStringParameters || {};
    
    let tiingoUrl = `https://api.tiingo.com/tiingo${path}`;
    
    // 构建查询参数
    const params = new URLSearchParams();
    params.append('token', apiToken);
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (resampleFreq) params.append('resampleFreq', resampleFreq);
    
    tiingoUrl += `?${params.toString()}`;
    
    console.log('Fetching stocks from:', tiingoUrl.replace(apiToken, '***'));
    
    const response = await fetch(tiingoUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'News-Stocks-Dashboard/1.0',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Tiingo API responded with status: ${response.status}`);
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
    console.error('Stocks API error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      } as Record<string, string>,
      body: JSON.stringify({ 
        error: 'Failed to fetch stock data',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};