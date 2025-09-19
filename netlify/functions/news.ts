import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        } as Record<string, string>,
        body: JSON.stringify({ error: 'News API key not configured' }),
      };
    }

    // 解析查询参数
    const { country = 'us', category = 'business', pageSize = '20' } = event.queryStringParameters || {};
    
    const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&pageSize=${pageSize}&apiKey=${apiKey}`;
    
    console.log('Fetching news from:', url.replace(apiKey, '***'));
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'News-Stocks-Dashboard/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`NewsAPI responded with status: ${response.status}`);
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
    console.error('News API error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      } as Record<string, string>,
      body: JSON.stringify({ 
        error: 'Failed to fetch news',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};