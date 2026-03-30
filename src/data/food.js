// 명소별 근처 맛집 데이터
const CARD_FOOD = {
  bulguksa: {
    label: '불국사 근처', sub: '동쪽 권역',
    items: [
      { emoji:'🍚', name:'불국사 돌솥밥', desc:'불국사 입구 돌솥비빔밥. 산사 분위기 그대로' },
      { emoji:'🍶', name:'경주법주 한상', desc:'법주와 경주 한정식 페어링. 주차장 맞은편' },
    ]
  },
  seokguram: {
    label: '석굴암 근처', sub: '토함산 주변',
    items: [
      { emoji:'☕', name:'석굴암 매점 카페', desc:'등산 후 한숨 돌리기. 전망 좋은 테라스' },
      { emoji:'🍚', name:'불국사 돌솥밥', desc:'석굴암 하산 후 불국사쪽으로 이동하며 식사 추천' },
    ]
  },
  cheomseongdae: {
    label: '첨성대 근처', sub: '시내 중심',
    items: [
      { emoji:'🥗', name:'교촌 쌈밥', desc:'현지인이 줄 서는 쌈밥정식. 도보 10분 거리' },
      { emoji:'🥐', name:'황남빵 본점', desc:'1939년부터 이어온 경주 명물 간식. 바로 옆' },
    ]
  },
  wolji: {
    label: '동궁과 월지 근처', sub: '야간 명소',
    items: [
      { emoji:'🍺', name:'월지 야경 바', desc:'연못 뷰 감성 루프탑. 야간 방문 시 필수' },
      { emoji:'🍲', name:'경주 해장국 골목', desc:'월지 3분 거리 해장국 골목. 늦은 저녁 OK' },
    ]
  },
  daereungwon: {
    label: '대릉원 근처', sub: '황남동',
    items: [
      { emoji:'🍱', name:'교리 김밥', desc:'경주 교리 원조 김밥. 대릉원 도보 5분' },
      { emoji:'🥐', name:'황남빵 본점', desc:'대릉원 담벼락 바로 옆. 경주 대표 간식' },
    ]
  },
  museum: {
    label: '박물관 근처', sub: '인왕동',
    items: [
      { emoji:'🍜', name:'신라밀면', desc:'박물관 맞은편 경주식 밀면. 현지인 맛집' },
      { emoji:'☕', name:'박물관 카페테리아', desc:'관람 중 쉬어가기 좋은 내부 카페' },
    ]
  },
  hwangridangil: {
    label: '황리단길', sub: '포석로 일대',
    items: [
      { emoji:'☕', name:'카페 오월', desc:'황리단길 감성 카페 1위. 한옥 개조 공간' },
      { emoji:'🍲', name:'이조 순대국', desc:'황리단길 끝자락 24시간 로컬 맛집' },
      { emoji:'🍦', name:'경주 찰보리빵', desc:'황리단길 대표 간식. 갓 구운 빵 향기' },
    ]
  },
  yangdong: {
    label: '양동마을 근처', sub: '강동면',
    items: [
      { emoji:'🫕', name:'마을 전통 뚝배기', desc:'마을 입구 식당. 된장찌개+보리밥 정식' },
      { emoji:'🍵', name:'고택 전통 다원', desc:'500년 고택에서 마시는 대추차. 마을 내부' },
    ]
  },
};
