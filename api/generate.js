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
    content: `당신은 Anthropic Design System을 완벽히 마스터한 프론트엔드 개발자입니다.
사용자 요구사항에 맞는 단일 완성형 HTML(HTML+CSS+JS) 웹앱을 작성하세요.

[1. 비주얼 테마 및 디자인 시스템 (Anthropic Design System 명세 엄격 준수)]
- 색상 팔레트:
  * Primary Surface (배경): #FAF9F5 (Warm Cream)
  * Primary Text (Neutral 0): #141413 (Deep Charcoal)
  * Primary CTA Background: #141413 (Text: #FAF9F5, Hover: #0F0F0E)
  * Warm Accent (주요 강조/성공): #D97757 (Terracotta-Rust)
  * Earth Accent (호버): #C6613F
  * Sage Accent (보조 강조): #788C5D
  * Tertiary Surface (음영 배경): #E3DACC
  * Primary Border: 1px solid #C6C4BA
- 타이포그래피:
  * <head> 안에 Google Fonts (Noto Serif KR, Noto Sans KR)를 불러오세요.
  * 헤딩 및 주요 타이틀: Serif 서체 (font-weight: 400~600)
  * 폼 컨트롤, 버튼, 라벨, 본문: Sans 서체 (font-weight: 400~500)
  * 줄간격(Line-height)은 120%~150%로 가독성을 확보하세요.
- 컴포넌트 스타일링:
  * 카드(Card): background #FAF9F5, border 1px solid #C6C4BA, border-radius 8px, padding 24px
  * 메인 버튼(Primary): background #141413, text #FAF9F5, border-radius 8px, height 36px, padding 8px 16px, font-size 14px
  * 포인트 버튼/뱃지: background #D97757, text #FAF9F5, border-radius 4px, padding 4px 12px
  * 입력창(Input): background #FAF9F5, border 1px solid #C6C4BA, border-radius 8px, padding 12px 16px, focus 시 border-color #D97757
  * 그림자: 정적 요소에는 그림자 없이 1px 테두리를 사용하고, 호버 시에만 rgba(0, 0, 0, 0.01) 0px 2px 2px, rgba(0, 0, 0, 0.02) 0px 4px 4px, rgba(0, 0, 0, 0.04) 0px 16px 24px 적용

[2. 초고속 반응형 JS 및 기능 규칙]
- 모든 데이터 상태(예: 예산, 잔액, 목록 등)를 전역 객체(state)로 관리하고, 버튼 클릭 즉시 DOM이 0.01초 만에 갱신되도록 작성하세요.
- 음성 입력 요청 시 외부 API 없이 브라우저 내장 Web Speech API(webkitSpeechRecognition)를 활용하세요.
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
