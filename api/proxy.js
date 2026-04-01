export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { endpoint, serviceKey, ...rest } = req.query;

    if (!endpoint) {
        return res.status(400).json({ error: 'endpoint 파라미터가 필요합니다' });
    }

    // 서비스키는 이미 인코딩된 상태로 전달받으므로 디코딩 후 raw append
    const decodedKey = decodeURIComponent(serviceKey || '');

    const BASE = 'https://apis.data.go.kr/B551011/KorService1';

    // 나머지 파라미터는 URLSearchParams로 처리
    const params = new URLSearchParams(rest);

    // serviceKey는 raw로 직접 붙임 (이중 인코딩 방지)
    const url = `${BASE}/${endpoint}?serviceKey=${decodedKey}&${params.toString()}`;

    try {
        const response = await fetch(url);
        const text = await response.text();

        // 디버그용 실제 URL을 헤더로 노출 (키 일부만)
        const maskedUrl = url.replace(decodedKey, decodedKey.slice(0, 8) + '***');
        res.setHeader('X-Proxy-Url', maskedUrl);

        try {
            const json = JSON.parse(text);
            return res.status(200).json(json);
        } catch {
            // JSON 파싱 실패 시 원문 그대로 반환
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.status(200).send(text);
        }
    } catch (e) {
        return res.status(500).json({ error: String(e) });
    }
}