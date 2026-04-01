export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { endpoint, serviceKey, ...rest } = req.query;

    if (!endpoint) {
        return res.status(400).json({ error: 'endpoint 파라미터가 필요합니다' });
    }

    const BASE = 'https://apis.data.go.kr/B551011/KorService2';

    // serviceKey는 포털에서 받은 Encoding Key 그대로 사용 (raw append — 이중 인코딩 방지)
    // 나머지 파라미터는 URLSearchParams로 처리
    const params = new URLSearchParams(rest);
    const finalUrl = `${BASE}/${endpoint}?serviceKey=${serviceKey}&${params.toString()}`;

    // 디버그용: 키 앞 20자 + 끝 4자만 노출
    const keyStr = serviceKey || '';
    const maskedKey = keyStr.length > 24
        ? keyStr.slice(0, 20) + '...' + keyStr.slice(-4)
        : keyStr;
    const debugUrl = `${BASE}/${endpoint}?serviceKey=${maskedKey}&${params.toString()}`;

    try {
        const response = await fetch(finalUrl);
        const text = await response.text();

        // JSON 응답이면 그대로 반환
        try {
            const json = JSON.parse(text);
            return res.status(200).json(json);
        } catch { /* XML 응답 처리 */ }

        // XML에서 오류코드 추출
        const codeMatch = text.match(/<returnReasonCode>([^<]+)<\/returnReasonCode>/);
        const authMatch = text.match(/<returnAuthMsg>([^<]+)<\/returnAuthMsg>/);
        const errMatch = text.match(/<errMsg>([^<]+)<\/errMsg>/);

        return res.status(200).json({
            _proxyError: true,
            _errorCode: codeMatch ? codeMatch[1] : null,
            _authMsg: authMatch ? authMatch[1] : null,
            _errMsg: errMatch ? errMatch[1] : null,
            _requestUrl: debugUrl,
            _rawXml: text
        });

    } catch (e) {
        return res.status(500).json({ error: String(e), _requestUrl: debugUrl });
    }
}