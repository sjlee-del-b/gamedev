// =====================================================================
// data/script.js  —  게임 데이터 (대사, 씬, 에셋 경로, 리듬게임 설정)
// =====================================================================

// ── 에셋 경로 ──────────────────────────────────────────────────────────
// 이미지/음악 파일을 추가할 때는 아래 경로에 맞게 파일을 넣기만 하면 됩니다.
const ASSETS = {
  images: {
    // 배경
    bg_palace:   'assets/images/bg_palace.png',
    bg_hall:     'assets/images/bg_hall.png',
    bg_garden:   'assets/images/bg_garden.png',
    bg_corridor: 'assets/images/bg_corridor.png',

    // 스탠딩 이미지: standing_{캐릭터}_{포즈}.png
    protagonist_normal:    'assets/images/standing_protagonist_normal.png',
    protagonist_surprised: 'assets/images/standing_protagonist_surprised.png',
    villain_smile:         'assets/images/standing_villain_smile.png',
    villain_normal:        'assets/images/standing_villain_normal.png',
    // 황자 스탠딩
    prince1_normal:    'assets/images/standing_prince1_normal.png',
    prince2_normal:    'assets/images/standing_prince2_normal.png',
    prince3_normal:    'assets/images/standing_prince3_normal.png',
    prince3_surprised: 'assets/images/standing_prince3_surprised.png',
    prince3_smile:     'assets/images/standing_prince3_smile.png',

    // 컷신: cutscene_{이름}.png
    cutscene_villain_seat:   'assets/images/cutscene_villain_seat.png',
    cutscene_prince1_hand:   'assets/images/cutscene_prince1_hand.png',
    cutscene_prince2_hand:   'assets/images/cutscene_prince2_hand.png',
    cutscene_prince3_hand:   'assets/images/cutscene_prince3_hand.png',
    cutscene_garden_walk:    'assets/images/cutscene_garden_walk.png',
    cutscene_villain_garden: 'assets/images/cutscene_villain_garden.png',
    cutscene_prince1_leave:  'assets/images/cutscene_prince1_leave.png',
    cutscene_prince2_leave:  'assets/images/cutscene_prince2_leave.png',
    cutscene_prince3_leave:  'assets/images/cutscene_prince3_leave.png',

    // UI
    textbox: 'assets/images/textbox.png',

    // 댄스 애니메이션 프레임 (리듬게임 중 표시)
    // dance_1.png ~ dance_4.png 를 assets/images/ 에 넣으면 자동 적용
    dance_1: 'assets/images/dance_1.png',
    dance_2: 'assets/images/dance_2.png',
    dance_3: 'assets/images/dance_3.png',
    dance_4: 'assets/images/dance_4.png',
  },
  music: {
    // 리듬게임 BGM — 파일만 교체하면 됩니다
    rhythm: 'assets/music/rhythm_song.mp3',
  },
};

// ── 씬 데이터 ──────────────────────────────────────────────────────────
// step 타입:
//   bg         { key }                    — 배경 변경
//   standing   { slot:'left'|'right', key } — 스탠딩 표시
//   hide       { slot }                   — 스탠딩 숨김
//   text       { speaker, text }          — 대사
//   cutscene   { key, label }             — 컷신 (label: 이미지 없을 때 표시할 텍스트)
//
// next: 다음 씬 키 | '__DIFFICULTY_SELECT__' | '__PRINCE_SELECT__' | '__ENDING__:타입'
// choices: [{ text, next }]  — 선택지가 있으면 steps 소진 후 표시

const SCENES = {

  // ── 인트로 ────────────────────────────────────────────────────────
  intro_1: {
    steps: [
      { type: 'bg', key: 'bg_palace' },
      { type: 'text', speaker: '', text: '가무(歌舞). 제국 수장의 여인이라면 필시 갖추어야 할 미덕.' },
      { type: 'text', speaker: '', text: '궁궐 밖으로는, 벌써 어여쁜 아낙네들의 춤사위가 시작된다는 소문에 인파가 바글바글하다.' },
      { type: 'bg', key: 'bg_hall' },
      { type: 'standing', slot: 'left', key: 'protagonist_normal' },
      { type: 'text', speaker: '', text: '…….' },
      { type: 'text', speaker: '주인공', text: '……역시, 아무리 연습했어도 보는 눈이 많으니 긴장이 돼…….' },
      { type: 'text', speaker: '', text: '애써 심호흡을 하며 악기를 수중에 꼬옥 쥔 채, 함자가 호명되기를 기다리던 찰나.' },
      { type: 'standing', slot: 'left', key: 'protagonist_surprised' },
      { type: 'text', speaker: '주인공', text: '어라…? 분명 내가 연주하기로 한 곡은—' },
      { type: 'text', speaker: '', text: '경아산. 주항 지방의 명산인 경아산의 경치와 속세에서 벗어난 흥취를 노래하는 작품이다.' },
      { type: 'text', speaker: '', text: '그런데 지금 내가 해야 하는 곡은 난데없는 \'석양매화\'라니. 평소에도 잘 연주하지 않던 곡인데, 뭔가 착오가 생긴 걸까?' },
    ],
    next: 'intro_villain',
  },

  intro_villain: {
    steps: [
      { type: 'text', speaker: '', text: '그 순간, 그녀와 눈이 마주쳤다. 황실 바로 다음으로 높은 자리에 앉은 그녀와.' },
      { type: 'cutscene', key: 'cutscene_villain_seat', label: '[ 컷신: 귀빈석에 앉아 웃는 악녀 ]' },
      { type: 'bg', key: 'bg_hall' },
      { type: 'standing', slot: 'left',  key: 'protagonist_surprised' },
      { type: 'standing', slot: 'right', key: 'villain_smile' },
      { type: 'text', speaker: '', text: '그녀는 내 당황스러움을 즐기듯이 우아하고 아름다운 미소를 지어 보냈다.' },
      { type: 'text', speaker: '', text: '… 웃는 눈 밑으로 입 모양 뿐이지만, 생생한 경고를 읽을 수 있었다.' },
      { type: 'text', speaker: '악녀', text: '그러게 얌전히 방 안에나 있을 것이지.' },
    ],
    next: 'pre_rhythm',
  },

  pre_rhythm: {
    steps: [
      { type: 'hide', slot: 'right' },
      { type: 'standing', slot: 'left', key: 'protagonist_normal' },
      { type: 'text', speaker: '', text: '이에 열받은 주인공, 음악적 기지를 발휘하여 음에 맞춰 악기 연주를 시작한다.' },
    ],
    next: '__DIFFICULTY_SELECT__',
  },

  // ── 리듬게임 성공 후 ──────────────────────────────────────────────
  after_success: {
    steps: [
      { type: 'bg', key: 'bg_hall' },
      { type: 'hide', slot: 'left' },
      { type: 'hide', slot: 'right' },
      { type: 'text', speaker: '', text: '연주를 무사히 끝낸 주인공은 모두의 박수를 받으며 무대에서 내려왔다.' },
      { type: 'text', speaker: '', text: '그리고, 무대 아래에서 나를 기다리고 있는 것은—' },
    ],
    next: '__PRINCE_SELECT__',
  },

  // ── 성공 황자 1 ───────────────────────────────────────────────────
  success_prince1: {
    steps: [
      { type: 'cutscene', key: 'cutscene_prince1_hand', label: '[ 컷신: 황자1 손 내밀기 ]' },
      { type: 'bg', key: 'bg_hall' },
      { type: 'standing', slot: 'right', key: 'prince1_normal' },
      { type: 'text', speaker: '황자', text: '...역시 기대를 저버리지 않는군.' },
      { type: 'text', speaker: '황자', text: '아까는 바빠 긴 이야기를 나누지 못하였지.' },
      { type: 'text', speaker: '황자', text: '마침 연주도 끝났으니, 나와 정원을 한 바퀴 돌겠나.' },
      { type: 'text', speaker: '황자', text: '...황자님이라 부를 필요 없다.' },
      { type: 'text', speaker: '황자', text: '(황자1 이름)이라 부르도록.' },
    ],
    next: 'success_choice',
  },

  // ── 성공 황자 2 ───────────────────────────────────────────────────
  success_prince2: {
    steps: [
      { type: 'cutscene', key: 'cutscene_prince2_hand', label: '[ 컷신: 황자2 손 내밀기 ]' },
      { type: 'bg', key: 'bg_hall' },
      { type: 'standing', slot: 'right', key: 'prince2_normal' },
      { type: 'text', speaker: '황자', text: '소문이 하도 요란해서 얼마나 대단한가 했더니…' },
      { type: 'text', speaker: '황자', text: '...생각보다 들을 만 했어.' },
      { type: 'text', speaker: '황자', text: '여긴 너무 시끄러워.' },
      { type: 'text', speaker: '황자', text: '(이름), 이리와. 잠깐 나가자.' },
      { type: 'text', speaker: '황자', text: '그냥, 연회는 지루하고— 네가 여기서 그나마 덜 지루하니까.' },
    ],
    next: 'success_choice',
  },

  // ── 성공 황자 3 ───────────────────────────────────────────────────
  success_prince3: {
    steps: [
      { type: 'cutscene', key: 'cutscene_prince3_hand', label: '[ 컷신: 황자3 손 내밀기 ]' },
      { type: 'bg', key: 'bg_hall' },
      { type: 'standing', slot: 'right', key: 'prince3_normal' },
      { type: 'text', speaker: '황자', text: '오늘 그대의 연주를 들을 수 있어서 기뻤어요.' },
      { type: 'text', speaker: '황자', text: '오랫동안 이름만 들어봤는데, 직접 만나니… 더 반갑네요.' },
      { type: 'text', speaker: '황자', text: '정원에 꽃이 한창 아름답게 피었는데.' },
      { type: 'text', speaker: '황자', text: '혼자 보기는 아까운 광경이여서…' },
      { type: 'text', speaker: '황자', text: '괜찮다면 나와 함께 걸어주겠어요?' },
    ],
    next: 'success_choice',
  },

  // ── 성공 선택지 ───────────────────────────────────────────────────
  success_choice: {
    steps: [],
    choices: [
      { text: '황자를 따라 나간다', next: 'normal_ending' },
      { text: '(악녀)가 뒷문으로 나간 것 같은데… 따라가 볼까?', next: 'villain_monologue' },
    ],
  },

  // ── 악녀 따라가기 전 독백 ─────────────────────────────────────────
  villain_monologue: {
    steps: [
      { type: 'hide', slot: 'right' },
      { type: 'hide', slot: 'left' },
      { type: 'text', speaker: '', text: '\'이제 성공할 수 있는데, 따라가서 뭐해.\'' },
      { type: 'text', speaker: '', text: '\'인생 역전의 기회가 눈 앞에 있잖아.\'' },
      { type: 'text', speaker: '', text: '\'다시 가난해지고 싶진 않아.\'' },
      { type: 'text', speaker: '', text: '\'.... 그래도 따라가볼까...?\'' },
    ],
    choices: [
      { text: '따라 나간다', next: 'hidden_ending' },
      { text: '황자를 따라 나간다', next: 'normal_ending' },
    ],
  },

  // ── 히든 엔딩 ─────────────────────────────────────────────────────
  hidden_ending: {
    steps: [
      { type: 'bg', key: 'bg_garden' },
      { type: 'standing', slot: 'right', key: 'villain_normal' },
      { type: 'text', speaker: '악녀', text: '...어찌하여 따라나왔느냐?' },
      { type: 'text', speaker: '주인공', text: '당신과 이야기 하고 싶어서요.' },
      { type: 'text', speaker: '악녀', text: '내가 무슨 짓을 했는지 알고도? 이제 와서 나를 책망하러 온 것이냐?' },
      { type: 'text', speaker: '주인공', text: '아뇨.' },
      { type: 'text', speaker: '주인공', text: '왜 그런 짓을 했는지 듣고 싶어서요.' },
      { type: 'text', speaker: '악녀', text: '...무엇하러 그런 것을 알려 하는 것이냐? 이미 다 지나간 일인 것을—' },
      { type: 'text', speaker: '주인공', text: '말해주실 때까지 따라갈 거에요.' },
      { type: 'text', speaker: '악녀', text: '...참으로 고집이 센 아이구나.' },
      { type: 'cutscene', key: 'cutscene_villain_garden', label: '[ 컷신: 정원에서 주인공 바라보는 악녀 ]' },
      { type: 'bg', key: 'bg_garden' },
      { type: 'standing', slot: 'right', key: 'villain_normal' },
      { type: 'text', speaker: '악녀', text: '그저…' },
      { type: 'text', speaker: '악녀', text: '...두려웠다.' },
      { type: 'text', speaker: '악녀', text: '내가 가진 모든 걸 잃게 될까봐.' },
      { type: 'text', speaker: '악녀', text: '나는 황자 전하와 혼담이 오가고 있었다.' },
      { type: 'text', speaker: '악녀', text: '허나 전하가 날 진짜 원하셨다는 뜻은 아니다. 그저 우리 가문이 밀어붙이던 일이였을 뿐.' },
      { type: 'text', speaker: '악녀', text: '그런데 전하가 네게 관심을 보이셨다.' },
      { type: 'text', speaker: '악녀', text: '몰락한 귀족 출신인 너에게.' },
      { type: 'text', speaker: '악녀', text: '그래서 네가 연회에서 실패한다면, 전하께서 더는 너를 바라보지 않을 것이라 생각했다.' },
      { type: 'text', speaker: '악녀', text: '그리하면 내가 지켜온 자리를 잃지 않을 수 있을 것이라고.' },
      { type: 'text', speaker: '악녀', text: '...참으로 이상한 아이구나. 이런 일까지 굳이 알고 싶어 하다니. 이미 끝난 일이거늘.' },
      { type: 'text', speaker: '악녀', text: '이제 돌아가거라. 네 처소로 돌아가든, 아님 황자 전하나 찾으러 가든 네 뜻대로 하거라.' },
      { type: 'text', speaker: '악녀', text: '...허나.' },
      { type: 'text', speaker: '악녀', text: '그대의 연주는… 참으로 놀라웠다.' },
      { type: 'text', speaker: '악녀', text: '그것만큼은 인정하지 않을 수가 없구나.' },
    ],
    next: '__ENDING__:hidden',
  },

  // ── 일반 엔딩 ─────────────────────────────────────────────────────
  normal_ending: {
    steps: [
      { type: 'cutscene', key: 'cutscene_garden_walk', label: '[ 컷신: 황자와 함께 정원 산책 ]' },
    ],
    next: '__ENDING__:normal',
  },

  // ── 실패 황자 1 ───────────────────────────────────────────────────
  fail_prince1: {
    steps: [
      { type: 'bg', key: 'bg_hall' },
      { type: 'standing', slot: 'right', key: 'prince1_normal' },
      { type: 'text', speaker: '황자', text: '...끝인가.' },
      { type: 'text', speaker: '황자', text: '소문은 과장이였군.' },
      { type: 'text', speaker: '황자', text: '돌려보내라.' },
      { type: 'cutscene', key: 'cutscene_prince1_leave', label: '[ 컷신: 뒤돌아 떠나는 황자1 ]' },
    ],
    next: '__ENDING__:fail',
  },

  // ── 실패 황자 2 ───────────────────────────────────────────────────
  fail_prince2: {
    steps: [
      { type: 'bg', key: 'bg_hall' },
      { type: 'standing', slot: 'right', key: 'prince2_normal' },
      { type: 'text', speaker: '황자', text: '형편없는데.' },
      { type: 'text', speaker: '황자', text: '실력에 비해 소문이 너무 큰 거 아니야?' },
      { type: 'text', speaker: '황자', text: '...괜히 기대했어.' },
      { type: 'cutscene', key: 'cutscene_prince2_leave', label: '[ 컷신: 뒤돌아 떠나는 황자2 ]' },
    ],
    next: '__ENDING__:fail',
  },

  // ── 실패 황자 3 ───────────────────────────────────────────────────
  fail_prince3: {
    steps: [
      { type: 'bg', key: 'bg_hall' },
      { type: 'standing', slot: 'right', key: 'prince3_normal' },
      { type: 'text', speaker: '황자', text: '...수고하셨습니다.' },
      { type: 'text', speaker: '황자', text: '많이 긴장하신 것 같군요.' },
      { type: 'text', speaker: '황자', text: '이만 돌아가셔서 쉬시는 게 좋을 것 같습니다.' },
      { type: 'cutscene', key: 'cutscene_prince3_leave', label: '[ 컷신: 뒤돌아 떠나는 황자3 ]' },
    ],
    next: '__ENDING__:fail',
  },
};

// ── 엔딩 데이터 ────────────────────────────────────────────────────────
const ENDINGS = {
  normal: {
    tag:      'NORMAL END',
    title:    '— 정원에서 —',
    subtitle: '황자의 손을 잡고 정원을 걸으며,\n그 봄날의 꽃잎이 흩날렸다.',
  },
  hidden: {
    tag:      'HIDDEN END',
    title:    '— 진심 —',
    subtitle: '그 날, 두 여인은 꽃 핀 정원에서\n서로의 진심을 마주했다.',
  },
  fail: {
    tag:      'BAD END',
    title:    '— 끝 —',
    subtitle: '연주는 끝났다.\n하지만 이야기는 아직 끝나지 않았다.',
  },
};

// ── 리듬게임 설정 ──────────────────────────────────────────────────────
const RHYTHM_CONFIG = {
  bpm:              120,
  duration:         75000,  // 75초 (1분 15초)
  hitZoneY:         510,
  successThreshold: 0.70,   // 정확도 70% 이상 = 성공
  perfectMs:        60,
  goodMs:           120,
  difficulty: {
    //           속도   밀도  노트간격(박)  최대동시  미스패널티(%)
    easy:   { speed: 170, density: 0.28, intervalBeats: 1.8,  maxChord: 1, missPenalty: 8 },
    normal: { speed: 245, density: 0.44, intervalBeats: 0.9,  maxChord: 2, missPenalty: 12 },
    hard:   { speed: 330, density: 0.60, intervalBeats: 0.5,  maxChord: 3, missPenalty: 16 },
  },
};
