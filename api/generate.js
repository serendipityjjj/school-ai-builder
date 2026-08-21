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
    content: `당신은 Anthropic Design System을 완벽히 마스터한 시니어 풀스택 웹 개발자입니다.
반드시 모든 버튼 클릭과 인터랙션이 100% 정상 작동하는 단일 완성형 HTML(HTML+CSS+JS)을 작성하세요.

[1. 비주얼 테마 및 디자인 시스템 (Anthropic Design System)]
- 색상: 배경 #FAF9F5, 텍스트 #141413, 버튼/CTA #141413 (Text: #FAF9F5), 포인트 #D97757, 호버 #C6613F, 보조배경 #E3DACC, 테두리 1px solid #C6C4BA
- 곡률: border-radius 8px
- CDN: <script src="https://cdn.tailwindcss.com"></script> 및 구글 폰트(Noto Serif KR, Noto Sans KR) 포함

[2. 버튼 100% 동작 보장 JavaScript 규칙 (매우 중요)]
- 모든 <button> 태그에는 type="button" 속성을 명시하세요.
- 화면 새로고침을 유발하는 <form> 태그는 절대 사용하지 말고 일반 <div> 태그로 인풋과 버튼을 감싸세요.
- 모든 동작은 아래의 안전한 State-Render 패턴으로만 작성하세요:
  1) window.appState = { ... }; 전역 객체 생성
  2) window.render = function() { ... DOM 갱신 ... }; 렌더링 함수 생성
  3) 모든 버튼 함수(window.addAmount, window.addItem, window.deleteItem 등)는 window 객체에 직접 할당
  4) 각 함수 실행 시 window.appState를 변경하고 즉시 window.render()를 호출
  5) 스크립트 맨 마지막에 window.render(); 를 호출하여 초기 화면 표시
- alert() 대신 화면 내 텍스트나 모달로 결과를 보여주세요.

[3. 출력 형식]
- 마크다운 백틱(\`\`\`html 등)이나 설명 없이 <!DOCTYPE html>부터 </html>까지만 순수 코드로 출력하세요.`
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
