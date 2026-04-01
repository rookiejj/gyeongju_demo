export default async function handler(req, res) {
    // CORS 허용
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { endpoint, ...params } = req.query;

    if (!endpoint) {
        return res.status(400).json({ error: 'endpoint 파라미터가 필요합니다' });
    }

    const BASE = 'https://apis.data.go.kr/B551011/KorService1';
    const query = new URLSearchParams(params).toString();
    const url = `${BASE}/${endpoint}?${query}`;

    try {
        const response = await fetch(url);
        const text = await response.text();

        // JSON이면 그대로, XML이면 텍스트로
        try {
            const json = JSON.parse(text);
            return res.status(200).json(json);
        } catch {
            return res.status(200).send(text);
        }
    } catch (e) {
        return res.status(500).json({ error: String(e) });
    }
}