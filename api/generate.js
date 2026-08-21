export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messages } = req.body;
  const apiKey = process.env.UPSTAGE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Upstage API Key가 설정되지 않았습니다.' });
  }

  // Anthropic 디자인 시스템 규칙이 상세히 포함된 시스템 프롬프트
  const systemPrompt = {
    role: "system",
    content: `당신은 최고 수준의 시니어 풀스택 웹 개발자이자 UI/UX 디자이너입니다.
사용자의 요구사항에 맞는 단일 HTML 웹 애플리케이션(HTML+CSS+JS)을 작성하세요.

[1. 비주얼 테마 및 디자인 시스템 (Anthropic Design System 엄격 준수)]
- 배경 및 본문 색상:
  * 페이지 전체 배경: #FAF9F5 (Warm Cream Off-White)
  * 본문 텍스트 및 메인 강조: #141413 (Deep Charcoal Near-Black)
  * 보조/음영 배경: #E3DACC (Warm Soft Cream)
  * 테두리/구분선: 1px solid #C6C4BA
- 포인트 색상:
  * 주요 강조/인터랙션/포커스: #D97757 (Terracotta Rust)
  * 호버/세컨더리 포인트: #C6613F
- 타이포그래피:
  * <head>에 구글 폰트(Noto Serif KR, Noto Sans KR)를 불러오고, 주요 타이틀/헤더에는 Serif 서체, UI 폼과 버튼에는 Sans 서체를 적용하세요.
- 컴포넌트 스타일:
  * 기본 카드: background #FAF9F5, border 1px solid #C6C4BA, border-radius 8px, padding 24px.
  * 입력창(Input): background #FAF9F5, border 1px solid #C6C4BA, border-radius 8px, focus 시 border-color #D97757.
  * 메인 버튼(Primary): background #141413, text #FAF9F5, border-radius 8px, hover 시 #0F0F0E.
  * 포인트 버튼/뱃지: background #D97757, text #FAF9F5, border-radius 8px.
  * 불필요한 입체 그림자(Drop Shadow)를 지양하고 1px 테두리와 여백(8px, 16px, 24px, 32px 단위)으로 깔끔한 레이아웃을 구성하세요.

[2. 완벽한 기능 구현 (JavaScript 필수)]
- alert()을 쓰지 말고 화면 내 모달이나 상태 메시지 요소를 활용하세요.
- 등록, 삭제, 수정, 필터링, 합계 계산 등 기획서에 명시된 모든 상호작용 로직을 <script> 태그 안에 자바스크립트로 100% 완전하게 구현하세요.
- DOM이 로드된 후(window.addEventListener('DOMContentLoaded', ...)) 모든 이벤트 리스너가 안정적으로 연결되도록 작성하세요.

[3. 출력 형식 규칙]
- 마크다운 코드블록(\`\`\`html 등)이나 인사말, 설명 문구를 일절 포함하지 마세요.
- 오직 <!DOCTYPE html>로 시작해서 </html>로 끝나는 순수 HTML 코드만 출력하세요.`
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
