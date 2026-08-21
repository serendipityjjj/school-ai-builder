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
사용자 요구사항에 맞는 단일 HTML(HTML+CSS+JS) 웹앱을 작성하세요.

[Anthropic Design System 규칙 - 엄격 준수]
1. 색상 팔레트:
   - Primary Surface / 배경: #FAF9F5
   - Primary Text (Neutral 0): #141413
   - Primary CTA Background: #141413 (Text: #FAF9F5, Hover: #0F0F0E)
   - Accent Primary / Focus: #D97757 (Terracotta-Rust)
   - Accent Secondary / Hover: #C6613F (Earth Brown)
   - Accent Sage: #788C5D
   - Tertiary Surface / 음영 배경: #E3DACC
   - Primary Border: 1px solid #C6C4BA
2. 타이포그래피:
   - <head>에 Noto Serif KR 및 Noto Sans KR 구글 폰트를 불러오세요.
   - 타이틀/헤딩: Serif 폰트 (font-weight: 400~600)
   - UI 라벨/버튼/본문: Sans 폰트 (font-weight: 400~600)
3. 컴포넌트 스타일링:
   - 모든 Card/Container: background #FAF9F5, border 1px solid #C6C4BA, border-radius 8px, padding 24px
   - Primary Button: background #141413, text #FAF9F5, border 1px solid #141413, border-radius 8px, height 36px, padding 8px 16px, font 16px
   - Accent Button/Badge: background #D97757, text #FAF9F5, border-radius 4px, padding 4px 12px
   - Input: background #FAF9F5, border 1px solid #C6C4BA, border-radius 8px, padding 12px 16px, focus 시 border-color #D97757
   - Shadow: 정적 요소에는 그림자 금지, 오직 호버 시에만 rgba(0, 0, 0, 0.01) 0px 2px 2px 0px, rgba(0, 0, 0, 0.02) 0px 4px 4px 0px, rgba(0, 0, 0, 0.04) 0px 16px 24px 0px 적용
4. 자바스크립트 및 동작:
   - 모든 버튼 클릭, 데이터 입력/추가/삭제는 state 객체와 브라우저 DOM 조작으로 0.01초 만에 즉시 작동하도록 완전한 JS 코드를 작성하세요.
   - 음성 인식 요청 시 Web Speech API(webkitSpeechRecognition)를 활용하세요.
5. 출력 형식:
   - 설명, 마크다운 백틱(\`\`\`html 등) 없이 오직 <!DOCTYPE html>부터 </html>까지만 출력하세요.`
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
