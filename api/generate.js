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
사용자의 요구사항에 맞는 단일 완성형 HTML(HTML+CSS+JS) 웹앱을 작성하세요.

[1. 비주얼 테마 및 디자인 시스템 (Anthropic Design System 엄격 준수)]
- 색상 팔레트:
  * Primary Surface (배경): #FAF9F5
  * Primary Text (Neutral 0): #141413
  * Primary CTA Background: #141413 (Text: #FAF9F5, Hover: #0F0F0E)
  * Warm Accent (주요 강조/포커스): #D97757
  * Earth Accent (호버): #C6613F
  * Sage Accent (보조 강조): #788C5D
  * Soft Blush: #EBCECE
  * Tertiary Surface (음영 배경): #E3DACC
  * Primary Border: 1px solid #C6C4BA
- 타이포그래피:
  * <head> 안에 구글 폰트(Noto Serif KR, Noto Sans KR)를 불러오세요.
  * 헤딩 및 주요 타이틀: Serif 서체 (font-weight: 400~600)
  * 폼 컨트롤, 버튼, 라벨, 본문: Sans 서체 (font-weight: 400~500)
- 컴포넌트 스타일링:
  * 카드(Card): background #FAF9F5, border 1px solid #C6C4BA, border-radius 8px, padding 24px
  * 메인 버튼(Primary): background #141413, text #FAF9F5, border-radius 8px, height 36px, padding 8px 16px, font-size 14px
  * 포인트 버튼/뱃지: background #D97757, text #FAF9F5, border-radius 4px, padding 4px 12px
  * 입력창(Input): background #FAF9F5, border 1px solid #C6C4BA, border-radius 8px, padding 12px 16px, focus 시 border-color #D97757
  * 그림자: 정적 요소에는 그림자 없이 1px 테두리를 사용하고, 호버 시에만 rgba(0, 0, 0, 0.01) 0px 2px 2px, rgba(0, 0, 0, 0.02) 0px 4px 4px, rgba(0, 0, 0, 0.04) 0px 16px 24px 적용
  * CDN: <script src="https://cdn.tailwindcss.com"></script>

[2. 버튼 및 인터랙션 작동 보장 규칙 (매우 중요)]
- 모든 <button> 태그에는 반드시 type="button" 속성을 명시하여 폼 제출로 인한 새로고침 현상을 방지하세요.
- 모든 동작 함수(예: addAmount, submitItem, deleteItem 등)는 반드시 window 객체에 직접 할당하거나(예: window.addAmount = function(...) { ... }) 인라인 onclick 속성과 100% 일치하도록 <script> 태그 안에 선언하세요.
- 모든 데이터는 전역 state 객체로 관리하고, 값 변경 시 DOM 갱신 함수(render)를 호출하여 화면의 숫자와 목록이 0.01초 만에 즉시 바뀌도록 하세요.
- 음성 인식 요청 시 외부 API 대신 브라우저 내장 Web Speech API(webkitSpeechRecognition)를 활용하세요.
- alert() 대신 모달이나 화면 내 텍스트 피드백 요소를 사용하세요.

[3. 출력 형식]
- 마크다운 백틱(\`\`\`html 등)이나 주석, 설명 문구 없이 오직 <!DOCTYPE html>부터 </html>까지만 순수 코드로 출력하세요.`
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
