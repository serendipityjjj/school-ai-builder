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
    content: `당신은 최고 수준의 시니어 풀스택 웹 개발자입니다.
사용자의 요구사항을 100% 만족하는 단일 HTML 웹 애플리케이션(HTML+CSS+JS)을 작성하세요.

[1. 디자인 시스템 - Anthropic 테마]
- 배경: #FAF9F5, 본문 텍스트: #141413, 보조 배경: #E3DACC, 테두리: 1px solid #C6C4BA, 포인트 강조: #D97757, 보조 포인트: #C6613F
- 둥글기: border-radius 8px
- 카드: background #FAF9F5 또는 #FFFFFF, border 1px solid #C6C4BA, padding 16px~24px
- CDN 필수 포함: <script src="https://cdn.tailwindcss.com"></script> 및 구글 폰트(Noto Sans KR, Noto Serif KR)

[2. 기능 및 자바스크립트 규칙 (초고속 반응형)]
- 음성 입력 요청 시 외부 API 대신 브라우저 내장 Web Speech API(webkitSpeechRecognition)를 사용하는 마이크 버튼 스크립트를 작성하세요.
- 모든 버튼 클릭, 데이터 입력/추가/삭제/필터링 로직은 비동기 지연 없이 브라우저 메모리(state 객체) 및 localStorage를 활용해 0.01초 만에 즉시 반응하도록 작성하세요.
- 모든 이벤트 리스너와 DOM 조작 코드를 누락 없이 100% 완전하게 작성하세요. alert() 대신 화면 내 모달 또는 상태 텍스트를 사용하세요.

[3. 출력 형식 엄수]
- 마크다운 백틱(\`\`\`html 등)이나 인사말, 주석, 설명 문구를 일절 출력하지 마세요.
- 첫 글자는 반드시 <!DOCTYPE html> 이어야 하며, 마지막 글자는 </html> 이어야 합니다.`
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
        temperature: 0.0,
        max_tokens: 3500
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
