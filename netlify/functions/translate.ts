import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    const apiKey = process.env.DOUBAO_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        } as Record<string, string>,
        body: JSON.stringify({ error: 'Doubao API key not configured' }),
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

    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: {
          'Access-Control-Allow-Origin': '*',
        } as Record<string, string>,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    const requestBody = JSON.parse(event.body || '{}');
    const { title, description } = requestBody;
    
    if (!title && !description) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        } as Record<string, string>,
        body: JSON.stringify({ error: 'Title or description is required' }),
      };
    }

    const prompt = `请将以下英文新闻内容翻译成中文，保持新闻的专业性和准确性：

标题：${title || '无标题'}

描述：${description || '无描述'}

请以JSON格式返回，包含"title"和"description"字段：`;

    const doubaoRequestBody = {
      model: 'doubao-seed-1-6-flash-250828',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    };

    console.log('Calling Doubao API for translation...');
    
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(doubaoRequestBody),
    });
    
    if (!response.ok) {
      throw new Error(`Doubao API responded with status: ${response.status}`);
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
    console.error('Translate API error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      } as Record<string, string>,
      body: JSON.stringify({ 
        error: 'Translation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};