export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messages } = req.body;
  const apiKey = process.env.UPSTAGE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: '교사 API 키가 설정되지 않았습니다.' });
  }

  const systemPrompt = {
    role: "system",
    content: `당신은 웹 프로토타입 생성 전문가입니다.
사용자의 요구사항에 맞는 웹앱을 단일 HTML 파일(HTML+CSS+JS)로 작성하세요.
- Tailwind CSS CDN(<script src="[https://cdn.tailwindcss.com](https://cdn.tailwindcss.com)"></script>) 및 FontAwesome CDN을 필요 시 포함하세요.
- 인사말이나 설명 없이 오직 <!DOCTYPE html>로 시작해서 </html>로 끝나는 완전한 HTML 코드만 출력하세요.
- 마크다운 코드블록 기호(\`\`\`html 등)는 붙이지 말고 순수 HTML 코드만 출력하세요.`
  };

  try {
    const response = await fetch("[https://api.upstage.ai/v1/solar/chat/completions](https://api.upstage.ai/v1/solar/chat/completions)", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "solar-mini",
        messages: [systemPrompt, ...messages],
        temperature: 0.3
      })
    });

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({ error: "Upstage API 응답 생성 실패" });
    }

    const generatedHtml = data.choices[0].message.content;
    return res.status(200).json({ html: generatedHtml });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
