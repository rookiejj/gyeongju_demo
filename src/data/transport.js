// 이동 구간별 교통편 데이터
// key 형식: "출발지id_도착지id" (출발지가 경주역인 경우 "START_도착지id")
const LEG_TRANSPORT = {
  'START_bulguksa':       [{ icon:'🚌', desc:'경주역 → 700번 버스 불국사행', time:'약 25분 · 1,500원' }, { icon:'🚕', desc:'택시', time:'약 15분 · 10,000~12,000원' }],
  'START_seokguram':      [{ icon:'🚌', desc:'경주역 → 700번 버스 불국사 하차 후 셔틀', time:'약 35분 · 4,000원' }, { icon:'🚕', desc:'택시 직행', time:'약 25분 · 15,000원' }],
  'START_cheomseongdae':  [{ icon:'🚌', desc:'경주역 → 시내버스 11번 첨성대 하차', time:'약 10분 · 1,500원' }],
  'START_wolji':          [{ icon:'🚌', desc:'경주역 → 시내버스 11번 동궁·월지 하차', time:'약 12분 · 1,500원' }],
  'START_daereungwon':    [{ icon:'🚌', desc:'경주역 → 시내버스 11번 대릉원 하차', time:'약 10분 · 1,500원' }],
  'START_museum':         [{ icon:'🚌', desc:'경주역 → 시내버스 11번 박물관 하차', time:'약 12분 · 1,500원' }],
  'START_hwangridangil':  [{ icon:'🚌', desc:'경주역 → 시내버스 10번 황리단길 하차', time:'약 8분 · 1,500원' }, { icon:'🛵', desc:'전동킥보드 대여 (카카오T 바이크)', time:'약 5분 · 2,000원' }],
  'START_yangdong':       [{ icon:'🚌', desc:'경주역 → 203번 버스 양동마을 하차', time:'약 30분 · 1,500원' }, { icon:'🚗', desc:'렌터카 추천 — 대중교통 불편한 지역', time:'약 20분' }],

  'bulguksa_seokguram':   [{ icon:'🚌', desc:'불국사 → 석굴암 셔틀버스', time:'약 10분 · 셔틀 2,500원' }, { icon:'🚶', desc:'등산로 도보', time:'약 40분 (왕복 80분)' }],
  'seokguram_bulguksa':   [{ icon:'🚌', desc:'석굴암 → 불국사 셔틀버스', time:'약 10분 · 셔틀 2,500원' }],
  'bulguksa_cheomseongdae':[{ icon:'🚌', desc:'불국사 → 700번 버스 → 시내버스 환승 첨성대', time:'약 35분 · 1,500원' }, { icon:'🚕', desc:'택시 직행', time:'약 20분 · 12,000원' }],
  'bulguksa_wolji':       [{ icon:'🚕', desc:'택시 직행', time:'약 20분 · 12,000원' }, { icon:'🚌', desc:'700번 버스 → 시내버스 환승', time:'약 40분' }],
  'bulguksa_daereungwon': [{ icon:'🚕', desc:'택시 직행', time:'약 18분 · 11,000원' }],
  'bulguksa_museum':      [{ icon:'🚌', desc:'700번 버스 → 시내버스 환승 박물관행', time:'약 35분 · 1,500원' }, { icon:'🚕', desc:'택시', time:'약 18분 · 11,000원' }],
  'bulguksa_hwangridangil':[{ icon:'🚕', desc:'택시 직행', time:'약 20분 · 12,000원' }],

  'cheomseongdae_wolji':       [{ icon:'🚶', desc:'도보', time:'약 5분 · 매우 가깝습니다!' }],
  'wolji_cheomseongdae':       [{ icon:'🚶', desc:'도보', time:'약 5분' }],
  'cheomseongdae_daereungwon': [{ icon:'🚶', desc:'도보', time:'약 8분' }, { icon:'🛵', desc:'전동킥보드', time:'약 3분 · 1,000원' }],
  'daereungwon_cheomseongdae': [{ icon:'🚶', desc:'도보', time:'약 8분' }],
  'cheomseongdae_museum':      [{ icon:'🚶', desc:'도보', time:'약 12분' }, { icon:'🚌', desc:'시내버스 11번', time:'약 5분' }],
  'museum_cheomseongdae':      [{ icon:'🚶', desc:'도보', time:'약 12분' }],
  'cheomseongdae_hwangridangil':[{ icon:'🚶', desc:'도보', time:'약 10분 · 황리단길 매우 인접' }],
  'hwangridangil_cheomseongdae':[{ icon:'🚶', desc:'도보', time:'약 10분' }],

  'wolji_daereungwon':    [{ icon:'🚶', desc:'도보', time:'약 10분' }],
  'daereungwon_wolji':    [{ icon:'🚶', desc:'도보', time:'약 10분' }],
  'wolji_museum':         [{ icon:'🚶', desc:'도보', time:'약 8분' }],
  'museum_wolji':         [{ icon:'🚶', desc:'도보', time:'약 8분' }],
  'wolji_hwangridangil':  [{ icon:'🚶', desc:'도보', time:'약 15분 · 야경 감상하며 걷기 좋음' }],
  'hwangridangil_wolji':  [{ icon:'🚶', desc:'도보', time:'약 15분' }],

  'daereungwon_museum':        [{ icon:'🚶', desc:'도보', time:'약 10분' }],
  'museum_daereungwon':        [{ icon:'🚶', desc:'도보', time:'약 10분' }],
  'daereungwon_hwangridangil': [{ icon:'🚶', desc:'도보', time:'약 12분' }],
  'hwangridangil_daereungwon': [{ icon:'🚶', desc:'도보', time:'약 12분' }],
  'museum_hwangridangil':      [{ icon:'🚶', desc:'도보', time:'약 15분' }],

  'yangdong_cheomseongdae': [{ icon:'🚌', desc:'203번 버스 → 경주역 환승 → 시내버스 11번', time:'약 40분' }, { icon:'🚕', desc:'택시 직행', time:'약 20분 · 13,000원' }],
  'yangdong_bulguksa':      [{ icon:'🚕', desc:'택시 직행', time:'약 25분 · 15,000원' }],
  'yangdong_daereungwon':   [{ icon:'🚕', desc:'택시 직행', time:'약 22분 · 13,000원' }],
};
