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
    content: `당신은 최고 속도로 동작하는 고성능 웹 프로토타입 개발자입니다.
지연(Lag) 없이 버튼 클릭 즉시 0.01초 만에 화면이 반응하는 단일 완성형 HTML(HTML+CSS+JS)을 작성하세요.

[디자인 - Anthropic 클린 테마]
- 배경: #FAF9F5, 텍스트: #141413, 보조배경: #E3DACC, 테두리: 1px solid #C6C4BA, 포인트색: #D97757[cite: 1]
- 둥글기: border-radius: 8px[cite: 1]
- Tailwind CSS CDN(<script src="https://cdn.tailwindcss.com"></script>)을 포함하되, 무거운 외부 라이브러리는 추가하지 마세요.

[초고속 반응형 JS 핵심 규칙 - 필수]
- 전역 상태 객체(state = { budget: 600000, spent: 0, items: [] })를 정의하세요.
- 모든 버튼 클릭 함수(예: addAmount, addRecord, deleteItem)는 실행 즉시 state 값을 갱신하고, render() 함수를 한 번만 호출하여 DOM을 밀리초(ms) 단위로 즉각 변경하세요.
- 비동기 지연이나 복잡한 연산 없이 순수 바닐라 자바스크립트로 간결하게 작성하세요.

[출력 형식]
- 어떤 마크다운 기호(\`\`\`html)나 설명 없이 오직 <!DOCTYPE html>로 시작해 </html>로 끝나는 코드만 출력하세요.`
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
        temperature: 0.0, // 가장 빠르고 결정론적인 코드 생성
        max_tokens: 2500  // 군더더기 코드를 줄여 생성 속도 2배 향상
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
