import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    const { prompt, context, type } = req.body;

    if (!prompt) {
      res.status(400).json({ success: false, message: 'プロンプトが必要です' });
      return;
    }

    // 環境変数からAPIキーを取得
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      res.status(500).json({ success: false, message: 'APIキーが設定されていません' });
      return;
    }

    let suggestion = '';

    // Gemini APIを使用（優先）
    if (process.env.GEMINI_API_KEY) {
      suggestion = await getGeminiSuggestion(prompt, context, type, apiKey);
    } 
    // OpenAI APIをフォールバックとして使用
    else if (process.env.OPENAI_API_KEY) {
      suggestion = await getOpenAISuggestion(prompt, context, type, apiKey);
    }

    res.status(200).json({
      success: true,
      suggestion,
      type: type || 'general'
    });

  } catch (error) {
    console.error('AI API Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'AI補完機能でエラーが発生しました' 
    });
  }
}

async function getGeminiSuggestion(prompt: string, context: string, type: string, apiKey: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
  
  let systemPrompt = '';
  
  switch (type) {
    case 'form_completion':
      systemPrompt = 'あなたは教育イベントのフォーム作成を支援するAIアシスタントです。ユーザーの入力に基づいて、適切で詳細な回答を提案してください。';
      break;
    case 'summary':
      systemPrompt = 'あなたは教育イベントの内容を要約するAIアシスタントです。簡潔で分かりやすい要約を提供してください。';
      break;
    default:
      systemPrompt = 'あなたは教育イベントの運営を支援するAIアシスタントです。';
  }

  const requestBody = {
    contents: [{
      parts: [{
        text: `${systemPrompt}\n\nコンテキスト: ${context || 'なし'}\n\nユーザーの質問: ${prompt}`
      }]
    }]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '申し訳ございませんが、AI補完を生成できませんでした。';
}

async function getOpenAISuggestion(prompt: string, context: string, type: string, apiKey: string) {
  const url = 'https://api.openai.com/v1/chat/completions';
  
  let systemPrompt = '';
  
  switch (type) {
    case 'form_completion':
      systemPrompt = 'あなたは教育イベントのフォーム作成を支援するAIアシスタントです。ユーザーの入力に基づいて、適切で詳細な回答を提案してください。';
      break;
    case 'summary':
      systemPrompt = 'あなたは教育イベントの内容を要約するAIアシスタントです。簡潔で分かりやすい要約を提供してください。';
      break;
    default:
      systemPrompt = 'あなたは教育イベントの運営を支援するAIアシスタントです。';
  }

  const requestBody = {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `コンテキスト: ${context || 'なし'}\n\n質問: ${prompt}` }
    ],
    max_tokens: 500,
    temperature: 0.7
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '申し訳ございませんが、AI補完を生成できませんでした。';
} 