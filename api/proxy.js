const BASES = {
    kor: 'https://apis.data.go.kr/B551011/KorService2',
    mdcl: 'https://apis.data.go.kr/B551011/MdclTursmService',
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { endpoint, serviceKey, service, ...rest } = req.query;

    if (!endpoint) {
        return res.status(400).json({ error: 'endpoint 파라미터가 필요합니다' });
    }

    const BASE = BASES[service] || BASES.kor;
    const params = new URLSearchParams(rest);
    const finalUrl = `${BASE}/${endpoint}?serviceKey=${serviceKey}&${params.toString()}`;

    const keyStr = serviceKey || '';
    const maskedKey = keyStr.length > 24
        ? keyStr.slice(0, 20) + '...' + keyStr.slice(-4)
        : keyStr;
    const debugUrl = `${BASE}/${endpoint}?serviceKey=${maskedKey}&${params.toString()}`;

    try {
        const response = await fetch(finalUrl);
        const text = await response.text();

        try {
            const json = JSON.parse(text);
            return res.status(200).json(json);
        } catch { /* XML */ }

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