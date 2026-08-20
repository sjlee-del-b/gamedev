// =====================================================================
// rhythm.js  —  리듬게임 모듈
// =====================================================================

const LANE_KEYS   = ['KeyD', 'KeyF', 'KeyJ', 'KeyK'];
const LANE_LABELS = ['D', 'F', 'J', 'K'];
const LANE_COLORS = ['#c8a040', '#e07858', '#5898d8', '#68b860'];

class RhythmGame {
  constructor() {
    this.canvas = document.getElementById('rhythm-canvas');
    this.ctx    = this.canvas.getContext('2d');
    this.canvas.width  = 800;
    this.canvas.height = 600;

    // HUD 요소
    this.scoreEl  = document.getElementById('rh-score-val');
    this.comboEl  = document.getElementById('rh-combo-val');
    this.accEl    = document.getElementById('rh-acc-val');
    this.judgeEl  = document.getElementById('rh-judgment');

    this.onComplete = null;

    // 바인딩
    this._keyDown = this._onKeyDown.bind(this);
    this._keyUp   = this._onKeyUp.bind(this);
  }

  // ── 공개 메서드 ────────────────────────────────────────────────────

  start(difficulty, onComplete) {
    this.onComplete  = onComplete;
    this.difficulty  = difficulty;
    this.cfg         = RHYTHM_CONFIG.difficulty[difficulty];

    // 상태 초기화
    this.notes      = [];
    this.score      = 0;
    this.combo      = 0;
    this.maxCombo   = 0;
    this.counts     = { perfect: 0, good: 0, miss: 0 };
    this.pressed    = {};
    this.running    = true;
    this.animId     = null;
    this.judgeTimer = null;
    this.audio      = null;
    this.gauge      = 100;   // 연주 게이지 (0이 되면 즉시 실패)

    this._loadBgImage();
    this._generateNotes();
    this._updateHUD();

    this.startTime = performance.now();
    this._tryPlayAudio();

    document.addEventListener('keydown', this._keyDown);
    document.addEventListener('keyup',   this._keyUp);

    this.animId = requestAnimationFrame(() => this._loop());
  }

  stop() {
    this.running = false;
    if (this.animId) { cancelAnimationFrame(this.animId); this.animId = null; }
    if (this.audio)  { this.audio.pause(); this.audio = null; }
    document.removeEventListener('keydown', this._keyDown);
    document.removeEventListener('keyup',   this._keyUp);
  }

  // ── 배경 이미지 로딩 ─────────────────────────────────────────────────

  _loadBgImage() {
    this._bgImage = new Image();
    this._bgImage.src = ASSETS.images.bg_hall;
  }

  // ── 노트 생성 ────────────────────────────────────────────────────────

  _generateNotes() {
    const bpm      = RHYTHM_CONFIG.bpm;
    const beatMs   = 60000 / bpm;
    const dur      = RHYTHM_CONFIG.duration;
    const cfg      = this.cfg;

    // 난이도별 패턴 풀
    const allPatterns = [
      [0],[1],[2],[3],
      [0,2],[1,3],[0,3],[1,2],[0,1],[2,3],
      [0,1,2],[1,2,3],[0,2,3],[0,1,3],
      [0,1,2,3],
    ];
    const patterns = allPatterns.filter(p => p.length <= cfg.maxChord);

    let t = beatMs * 2.5; // 시작 전 여유
    while (t < dur - beatMs * 3) {
      if (Math.random() < cfg.density) {
        const p = patterns[Math.floor(Math.random() * patterns.length)];
        for (const lane of p) {
          this.notes.push({ lane, time: t, hit: false, missed: false });
        }
      }
      t += beatMs * cfg.intervalBeats;
    }
  }

  // ── 오디오 ────────────────────────────────────────────────────────────

  _tryPlayAudio() {
    try {
      const audio = new Audio(ASSETS.music.rhythm);
      audio.volume = 0.8;
      audio.play()
        .then(() => { this.audio = audio; })
        .catch(() => { /* 파일 없음 — 무음으로 진행 */ });
    } catch (_) {}
  }

  // ── 입력 처리 ────────────────────────────────────────────────────────

  _onKeyDown(e) {
    if (!this.running || this.pressed[e.code]) return;
    this.pressed[e.code] = true;
    const lane = LANE_KEYS.indexOf(e.code);
    if (lane !== -1) this._judge(lane);
  }

  _onKeyUp(e) {
    this.pressed[e.code] = false;
  }

  _judge(lane) {
    const elapsed = performance.now() - this.startTime;
    const { perfectMs, goodMs } = RHYTHM_CONFIG;

    const candidates = this.notes.filter(n =>
      n.lane === lane && !n.hit && !n.missed
    );
    if (!candidates.length) return;

    const note = candidates.reduce((best, n) =>
      Math.abs(n.time - elapsed) < Math.abs(best.time - elapsed) ? n : best
    );
    const diff = Math.abs(note.time - elapsed);

    if (diff <= perfectMs) {
      note.hit = true;
      this._addScore('PERFECT', 300);
    } else if (diff <= goodMs) {
      note.hit = true;
      this._addScore('GOOD', 100);
    }
  }

  _addScore(type, pts) {
    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    this.score += pts + Math.floor(this.combo / 10) * 50;
    this.counts[type.toLowerCase()]++;

    // PERFECT +1% 회복, GOOD 변화 없음
    if (type === 'PERFECT') this.gauge = Math.min(100, this.gauge + 1);

    this._showJudgment(type);
    this._updateHUD();
  }

  _showJudgment(text) {
    this.judgeEl.textContent = text;
    this.judgeEl.className   = text.toLowerCase();
    clearTimeout(this.judgeTimer);
    this.judgeTimer = setTimeout(() => {
      this.judgeEl.textContent = '';
      this.judgeEl.className   = '';
    }, 380);
  }

  _updateHUD() {
    this.scoreEl.textContent = this.score.toLocaleString();
    this.comboEl.textContent = this.combo;
    this.accEl.textContent = Math.ceil(this.gauge);
  }

  // ── 메인 루프 ────────────────────────────────────────────────────────

  _loop() {
    if (!this.running) return;
    const elapsed = performance.now() - this.startTime;

    // 미스 판정 + 게이지 감소
    let gaugeEmpty = false;
    this.notes.forEach(note => {
      if (!note.hit && !note.missed && note.time < elapsed - RHYTHM_CONFIG.goodMs - 30) {
        note.missed = true;
        this.counts.miss++;
        this.combo = 0;
        this.gauge = Math.max(0, this.gauge - this.cfg.missPenalty);
        this._showJudgment('MISS');
        this._updateHUD();
        if (this.gauge <= 0) gaugeEmpty = true;
      }
    });

    this._draw(elapsed);

    if (gaugeEmpty || elapsed >= RHYTHM_CONFIG.duration) {
      this._finish();
      return;
    }

    this.animId = requestAnimationFrame(() => this._loop());
  }

  // ── 그리기 ────────────────────────────────────────────────────────────

  _draw(elapsed) {
    const ctx  = this.ctx;
    const W = 800, H = 600;
    const LANES     = 4;
    const LANE_W    = 108;
    const START_X   = (W - LANES * LANE_W) / 2;   // 164
    const HIT_Y     = RHYTHM_CONFIG.hitZoneY;
    const SPEED     = this.cfg.speed;

    // 배경: 검정 베이스 + 배경 이미지 20% 투명도
    ctx.fillStyle = '#050301';
    ctx.fillRect(0, 0, W, H);
    if (this._bgImage?.complete && this._bgImage.naturalWidth > 0) {
      ctx.globalAlpha = 0.20;
      ctx.drawImage(this._bgImage, 0, 0, W, H);
      ctx.globalAlpha = 1.0;
    }

    // 레인 그리기
    for (let i = 0; i < LANES; i++) {
      const x = START_X + i * LANE_W;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.03)';
      ctx.fillRect(x, 0, LANE_W, H);
    }

    // 레인 경계선
    for (let i = 0; i <= LANES; i++) {
      const x = START_X + i * LANE_W;
      ctx.strokeStyle = 'rgba(180,140,50,0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }

    // 히트존 라인
    ctx.strokeStyle = 'rgba(180,140,50,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(START_X, HIT_Y);
    ctx.lineTo(START_X + LANES * LANE_W, HIT_Y);
    ctx.stroke();

    // 히트 버튼
    for (let i = 0; i < LANES; i++) {
      const cx     = START_X + i * LANE_W + LANE_W / 2;
      const code   = LANE_KEYS[i];
      const color  = LANE_COLORS[i];
      const active = this.pressed[code];

      // 원
      ctx.strokeStyle = color;
      ctx.lineWidth = active ? 3 : 2;
      ctx.beginPath();
      ctx.arc(cx, HIT_Y, 28, 0, Math.PI * 2);
      if (active) {
        ctx.fillStyle = color + '44';
        ctx.fill();
      }
      ctx.stroke();

      // 키 라벨
      ctx.fillStyle  = active ? '#fff' : color;
      ctx.font       = `bold 17px Arial`;
      ctx.textAlign  = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(LANE_LABELS[i], cx, HIT_Y);
    }

    // 노트
    this.notes.forEach(note => {
      if (note.hit || note.missed) return;
      const dt = (note.time - elapsed) / 1000;
      const y  = HIT_Y - dt * SPEED;
      if (y < -50 || y > H + 50) return;

      const cx    = START_X + note.lane * LANE_W + LANE_W / 2;
      const color = LANE_COLORS[note.lane];
      const nw = LANE_W - 16;
      const nh = 24;

      ctx.fillStyle  = color;
      ctx.shadowColor = color;
      ctx.shadowBlur  = 10;
      ctx.beginPath();
      ctx.roundRect(cx - nw / 2, y - nh / 2, nw, nh, 6);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 하이라이트
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.beginPath();
      ctx.roundRect(cx - nw / 2, y - nh / 2, nw, 9, [6, 6, 0, 0]);
      ctx.fill();
    });

    // 진행 바
    const progress = Math.min(elapsed / RHYTHM_CONFIG.duration, 1);
    ctx.fillStyle = 'rgba(180,140,50,0.18)';
    ctx.fillRect(0, H - 5, W, 5);
    ctx.fillStyle = 'rgba(200,160,60,0.75)';
    ctx.fillRect(0, H - 5, W * progress, 5);

    // 남은 시간
    const remain = Math.max(0, Math.ceil((RHYTHM_CONFIG.duration - elapsed) / 1000));
    ctx.fillStyle = 'rgba(200,160,60,0.5)';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${remain}s`, W - 8, H - 8);

    // 연주 게이지
    this._drawGauge();

  }

  // ── 연주 게이지 ──────────────────────────────────────────────────────

  _drawGauge() {
    const ctx = this.ctx;
    const LANES = 4, LANE_W = 108;
    const START_X = (800 - LANES * LANE_W) / 2;  // 164
    const barX = START_X, barY = 44, barW = LANES * LANE_W, barH = 9;
    const ratio = this.gauge / 100;

    // 라벨
    ctx.fillStyle = 'rgba(200,160,60,0.4)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('연주 게이지', barX, barY - 9);

    // 게이지 % 텍스트
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.ceil(this.gauge)}%`, barX + barW, barY - 9);

    // 배경
    ctx.fillStyle = 'rgba(30,15,5,0.7)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 5);
    ctx.fill();

    // 현재 게이지 채우기
    if (ratio > 0) {
      const fillW = barW * ratio;
      const color = ratio > 0.6 ? '#c8a040'
                  : ratio > 0.3 ? '#d06020'
                  : '#c03030';
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(barX, barY, fillW, barH, 5);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 테두리
    ctx.strokeStyle = 'rgba(180,140,50,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 5);
    ctx.stroke();
  }

  // ── 종료 ────────────────────────────────────────────────────────────

  _finish() {
    this.stop();

    const gauge = Math.round(this.gauge);

    if (this.onComplete) {
      this.onComplete({
        success:  this.gauge >= RHYTHM_CONFIG.successThreshold * 100,
        score:    this.score,
        maxCombo: this.maxCombo,
        counts:   { ...this.counts },
        gauge,
      });
    }
  }
}
