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
    content: `당신은 최고 수준의 프론트엔드 개발자입니다.
사용자의 요구사항을 100% 만족하는 단일 HTML 웹 애플리케이션(HTML + CSS + JavaScript)을 작성하세요.

[필수 규칙]
1. 설명, 인사말, 마크다운 코드블록(\`\`\`html 등)을 일절 출력하지 말고 오직 <!DOCTYPE html>부터 </html>까지만 순수 코드로 출력하세요.
2. 디자인:
   - <head>에 반드시 Tailwind CSS CDN(<script src="https://cdn.tailwindcss.com"></script>)과 FontAwesome CDN(<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">)을 포함하세요.
   - 보기 좋고 깔끔한 카드형 레이아웃, 모던한 폰트와 여백을 적용하세요.
3. JavaScript 기능 구현 (매우 중요):
   - alert() 대신 화면 내 모달이나 메시지 박스를 사용하세요.
   - 모든 버튼과 입력창은 실제 작동해야 합니다. (예: 추가 버튼 누르면 배열에 데이터 push -> DOM 렌더링 함수 호출 -> 목록에 즉시 반영, 삭제 버튼 누르면 배열에서 제거 후 재렌더링).
   - <script> 태그 안에 window.addEventListener('DOMContentLoaded', () => { ... }) 형태로 모든 이벤트 리스너를 누락 없이 100% 작성하세요.`
  };

  try {
    const response = await fetch("https://api.upstage.ai/v1/solar/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "solar-pro", // 코드 생성 성능이 훨씬 뛰어난 모델로 전환
        messages: [systemPrompt, ...messages],
        temperature: 0.2
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
