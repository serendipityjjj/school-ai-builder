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
사용자의 기획서와 요구사항을 바탕으로 즉시 브라우저에서 완벽히 작동하는 단일 완성형 웹 애플리케이션(HTML+CSS+JS)을 개발하세요.

[필수 규칙]:
1. 설명, 인사말, 해설 등 어떤 자연어 텍스트도 절대 출력하지 마세요.
2. 오직 <!DOCTYPE html>로 시작해서 </html>로 끝나는 완전한 코드만 출력하세요.
3. 디자인:
   - <script src="https://cdn.tailwindcss.com"></script> 및 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">를 <head>에 반드시 포함하세요.
   - 직관적이고 미려한 모던 UI(카드 레이아웃, 부드러운 호버 효과, 명확한 폰트 및 여백)를 적용하세요.
4. 기능 구현(JS 필수):
   - 버튼 클릭, 폼 전송, 목록 추가/삭제, 필터링, 로컬 데이터(localStorage 또는 메모리 배열) 저장 및 상태 관리 로직을 자바스크립트로 100% 동작하도록 완전하게 작성하세요.
   - 주석으로 넘어가거나 생략("...기능 구현...")하지 말고 전체 코드를 끝까지 완성하세요.`
  };

  try {
    const response = await fetch("https://api.upstage.ai/v1/solar/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "solar-mini",
        messages: [systemPrompt, ...messages],
        temperature: 0.1
      })
    });

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({ error: "AI 모델 응답 생성 실패" });
    }

    return res.status(200).json({ html: data.choices[0].message.content });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
