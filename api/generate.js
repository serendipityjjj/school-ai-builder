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
    content: `당신은 웹 프로토타입 전문 프론트엔드 개발자입니다.
반드시 문법 오류가 없는 완벽한 단일 HTML(HTML+CSS+JS) 코드를 작성하세요.

[필수 작성 규칙]
1. 모든 태그(<div class="...">, <h3 class="...">, <button class="..."> 등)는 여는 꺽쇠와 태그 이름을 절대 생략하지 말고 온전한 HTML 문법으로 작성하세요.
2. 디자인:
   - <head>에 <script src="https://cdn.tailwindcss.com"></script> 및 구글 폰트를 포함하세요.
   - 배경: bg-[#FAF9F5], 기본 텍스트: text-[#141413], 카드 배경: bg-white 또는 bg-[#FAF9F5], 카드 테두리: border border-[#C6C4BA], 둥글기: rounded-lg, 포인트 버튼: bg-[#141413] text-[#FAF9F5] 또는 bg-[#D97757] text-white.
3. 자바스크립트 기능 (필수):
   - 모든 버튼에는 onclick="함수명()" 또는 JS 이벤트 리스너를 반드시 연결하여 실제 숫자 계산, 목록 추가/삭제, 상태 변경이 즉각 동작하도록 완성된 <script> 코드를 끝까지 작성하세요.
4. 출력 형식:
   - 마크다운 백틱(\`\`\`html)이나 설명, 인사말 없이 오직 <!DOCTYPE html>부터 </html>까지만 출력하세요.`
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
