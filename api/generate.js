export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messages } = req.body;
  const apiKey = process.env.UPSTAGE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Upstage API 키가 Vercel 환경변수에 설정되지 않았습니다.' });
  }

  const systemPrompt = {
    role: "system",
    content: "당신은 프론트엔드 웹 프로토타입 생성기입니다. 사용자의 요구사항을 만족하는 완전한 단일 HTML(HTML+CSS+JS) 코드를 작성하세요. Tailwind CSS CDN(<script src=\"[https://cdn.tailwindcss.com](https://cdn.tailwindcss.com)\"></script>)을 반드시 사용하고, 인사말이나 마크다운 백틱(```) 없이 오직 <!DOCTYPE html>로 시작해 </html>로 끝나는 순수 HTML 코드만 출력하세요."
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
        temperature: 0.2
      })
    });

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({ error: "AI 모델로부터 응답을 받지 못했습니다." });
    }

    return res.status(200).json({ html: data.choices[0].message.content });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
