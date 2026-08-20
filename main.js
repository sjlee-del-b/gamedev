// =====================================================================
// main.js  —  게임 전체 흐름 관리
// =====================================================================

class GameManager {
  constructor() {
    this.story  = new StoryEngine();
    this.rhythm = new RhythmGame();

    // 게임 상태
    this.rhythmSuccess    = false;
    this.selectedPrince   = null;

    // DOM
    this.$title      = document.getElementById('title-screen');
    this.$difficulty = document.getElementById('difficulty-screen');
    this.$tutorial   = document.getElementById('tutorial-screen');
    this.$countdown  = document.getElementById('countdown-screen');
    this.$cdNum      = document.getElementById('countdown-num');
    this.$canvas     = document.getElementById('rhythm-canvas');
    this.$hud        = document.getElementById('rhythm-hud');
    this.$rrResult   = document.getElementById('rhythm-result-screen');
    this.$ending     = document.getElementById('ending-screen');
    this.$storyLayer = document.getElementById('story-layer');

    // 스토리 콜백 연결
    this.story.onSceneEnd = (key, next) => this._handleNext(next);
    this.story.onChoice   = (next)       => this._handleNext(next);

    this._bindUI();
  }

  _bindUI() {
    // 타이틀 클릭 → 시작
    this.$title.addEventListener('click', () => {
      this.$title.classList.add('hidden');
      this.story.loadScene('intro_1');
    });

    // 난이도 버튼 → 튜토리얼 표시
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._pendingDifficulty = btn.dataset.diff;
        this.$difficulty.classList.add('hidden');
        this.$tutorial.classList.remove('hidden');
      });
    });

    // 튜토리얼 시작 버튼 → 카운트다운
    document.getElementById('tut-start-btn').addEventListener('click', () => {
      this.$tutorial.classList.add('hidden');
      this._startCountdown(this._pendingDifficulty);
    });

    // 리듬 결과 → 계속
    document.getElementById('rr-continue-btn').addEventListener('click', () => {
      this.$rrResult.classList.add('hidden');
      this._afterRhythm();
    });

    // 엔딩 → 처음으로
    document.getElementById('ending-retry-btn').addEventListener('click', () => {
      location.reload();
    });
  }

  // ── 씬 전환 핸들러 ──────────────────────────────────────────────────

  _handleNext(next) {
    if (!next) return;

    if (next === '__DIFFICULTY_SELECT__') {
      this.story.hide();
      this.$difficulty.classList.remove('hidden');
      return;
    }

    if (next === '__PRINCE_SELECT__') {
      this._showPrinceSelect(false);
      return;
    }

    if (next.startsWith('__ENDING__:')) {
      this._showEnding(next.split(':')[1]);
      return;
    }

    this.story.loadScene(next);
  }

  // ── 카운트다운 ──────────────────────────────────────────────────────

  _startCountdown(difficulty) {
    this.$storyLayer.style.display = 'none';
    this.$countdown.classList.remove('hidden');

    let count = 3;
    this.$cdNum.textContent = count;

    const tick = setInterval(() => {
      count--;
      if (count > 0) {
        this.$cdNum.textContent = count;
      } else {
        clearInterval(tick);
        this.$cdNum.textContent = 'GO!';
        setTimeout(() => {
          this.$countdown.classList.add('hidden');
          this._startRhythm(difficulty);
        }, 600);
      }
    }, 800);
  }

  // ── 리듬게임 ────────────────────────────────────────────────────────

  _startRhythm(difficulty) {
    this.$canvas.classList.remove('hidden');
    this.$hud.classList.remove('hidden');

    this.rhythm.start(difficulty, result => {
      this.$canvas.classList.add('hidden');
      this.$hud.classList.add('hidden');
      this._showRhythmResult(result);
    });
  }

  _showRhythmResult(result) {
    this.rhythmSuccess = result.success;

    const titleEl = document.getElementById('rr-title');
    titleEl.textContent = result.success ? '연주 성공!' : '연주 실패';
    titleEl.className   = result.success ? 'success' : 'fail';

    document.getElementById('rr-stats').innerHTML =
      `점수: <b>${result.score.toLocaleString()}</b><br>` +
      `최대 콤보: <b>${result.maxCombo}</b><br>` +
      `PERFECT: <b>${result.counts.perfect}</b> &nbsp;` +
      `GOOD: <b>${result.counts.good}</b> &nbsp;` +
      `MISS: <b>${result.counts.miss}</b><br>` +
      `연주 게이지: <b>${result.gauge}%</b>` +
      (result.success ? `<br><span style="color:#c8a040;font-size:13px;">※ 게이지 70% 이상 달성!</span>` : '');

    this.$rrResult.classList.remove('hidden');
  }

  _afterRhythm() {
    this.$storyLayer.style.display = '';
    if (this.rhythmSuccess) {
      this.story.loadScene('after_success');
    } else {
      this._showPrinceSelect(true);
    }
  }

  // ── 황자 선택 ────────────────────────────────────────────────────────

  _showPrinceSelect(isFail) {
    this.story.hide();

    const area = document.getElementById('choice-area');
    area.classList.remove('hidden');
    area.innerHTML = '';

    const label = document.createElement('p');
    label.style.cssText = 'color:#c8a040;letter-spacing:2px;font-size:13px;margin-bottom:6px;text-align:center;width:100%;';
    label.textContent = '황자를 선택하세요';
    area.appendChild(label);

    [1, 2, 3].forEach(n => {
      const btn = document.createElement('button');
      btn.className   = 'choice-btn';
      btn.textContent = `황자 ${n}`;
      btn.addEventListener('click', () => {
        area.classList.add('hidden');
        this.selectedPrince = n;
        const sceneKey = isFail ? `fail_prince${n}` : `success_prince${n}`;
        this.story.loadScene(sceneKey);
      });
      area.appendChild(btn);
    });
  }

  // ── 엔딩 ────────────────────────────────────────────────────────────

  _showEnding(type) {
    const data = ENDINGS[type] || { tag: 'END', title: '— 끝 —', subtitle: '' };
    document.getElementById('ending-tag').textContent      = data.tag;
    document.getElementById('ending-title').textContent    = data.title;
    document.getElementById('ending-subtitle').textContent = data.subtitle;

    this.$storyLayer.style.display = 'none';
    this.$ending.classList.remove('hidden');
  }
}

// ── 시작 ──────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  new GameManager();
});
