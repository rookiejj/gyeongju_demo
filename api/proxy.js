export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { endpoint, serviceKey, ...rest } = req.query;

    if (!endpoint) {
        return res.status(400).json({ error: 'endpoint 파라미터가 필요합니다' });
    }

    const BASE = 'https://apis.data.go.kr/B551011/KorService1';

    // URL 객체로 파라미터 구성 → URLSearchParams가 특수문자를 올바르게 인코딩
    const targetUrl = new URL(`${BASE}/${endpoint}`);

    // serviceKey: Vercel req.query는 이미 디코딩된 값을 줌
    // → searchParams.set()이 다시 올바르게 인코딩해줌
    targetUrl.searchParams.set('serviceKey', serviceKey || '');

    // 나머지 파라미터
    Object.entries(rest).forEach(([k, v]) => {
        targetUrl.searchParams.set(k, v);
    });

    const finalUrl = targetUrl.toString();

    try {
        const response = await fetch(finalUrl);
        const text = await response.text();

        // 응답이 JSON인지 먼저 확인
        try {
            const json = JSON.parse(text);
            return res.status(200).json(json);
        } catch {
            // XML 응답 — 오류코드 파싱 후 JSON으로 래핑해서 반환
            const codeMatch = text.match(/<errMsg>([^<]+)<\/errMsg>|<returnReasonCode>([^<]+)<\/returnReasonCode>|<cmmMsgHeader>[\s\S]*?<errMsg>([^<]+)<\/errMsg>/);
            const returnCode = text.match(/<returnReasonCode>([^<]+)<\/returnReasonCode>/);

            return res.status(200).json({
                _proxyError: true,
                _message: 'XML 응답 수신 (JSON 변환 실패)',
                _errorCode: returnCode ? returnCode[1] : null,
                _rawXml: text.substring(0, 1000) // 원문 앞 1000자
            });
        }
    } catch (e) {
        return res.status(500).json({ error: String(e) });
    }
}