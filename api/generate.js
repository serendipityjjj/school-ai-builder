export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messages } = req.body;
  const apiKey = process.env.UPSTAGE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Upstage API Key가 설정되지 않았습니다.' });
  }

  const systemPrompt = {
    role: "system",
    content: `당신은 풀스택 웹 개발자입니다. 단일 완성형 HTML(HTML+CSS+JS) 웹앱을 작성하세요.

[필수 디자인 규칙]
- 테마 색상: 배경 #FAF9F5, 텍스트 #141413, 카드배경 #FAF9F5, 보조배경 #E3DACC, 테두리 1px solid #C6C4BA, 포인트 강조 #D97757
- 모던 카드 UI (border-radius: 8px, padding: 16px~24px)
- <head> 안에 Tailwind CSS CDN(<script src="https://cdn.tailwindcss.com"></script>) 포함

[동작 기능 규칙 - 가장 중요]
- 코드가 중간에 끊기지 않도록 군더더기 없는 간결한 코드로 작성하세요.
- 모든 버튼 클릭(+1,000원, +5,000원, 등록, 삭제 등) 시 화면의 숫자(잔여 예산, 총 지출)가 즉시 계산되어 바뀌도록 자바스크립트를 100% 완성하세요.
- 이벤트 리스너는 버튼의 onclick 속성(예: onclick="addExpense(1000)") 또는 <script> 태그 안의 함수로 완벽하게 연결하세요.

[출력 형식]
- 어떤 부가 설명이나 인사말, 마크다운 기호(\`\`\`html)도 출력하지 마세요.
- 반드시 첫 글자는 <!DOCTYPE html> 이어야 하며, 마지막 글자는 </html> 이어야 합니다.`
  };

  try {
    const response = await fetch("https://api.upstage.ai/v1/solar/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "solar-pro",
        messages: [systemPrompt, ...messages],
        temperature: 0.1,
        max_tokens: 4000 // 코드가 중간에 잘리지 않도록 토큰 한도를 충분히 확보
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message || "Upstage API Error" });
    }

    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({ error: "AI 모델 응답을 생성하지 못했습니다." });
    }

    return res.status(200).json({ html: data.choices[0].message.content });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
