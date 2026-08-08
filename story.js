// =====================================================================
// story.js  —  비주얼 노벨 엔진
// =====================================================================

class StoryEngine {
  constructor() {
    this.bgEl          = document.getElementById('bg-layer');
    this.standingLeft  = document.getElementById('standing-left');
    this.standingRight = document.getElementById('standing-right');
    this.cutsceneLayer = document.getElementById('cutscene-layer');
    this.cutsceneImg   = document.getElementById('cutscene-img');
    this.cutscenePH    = document.getElementById('cutscene-placeholder');
    this.textboxWrap   = document.getElementById('textbox-wrap');
    this.speakerName   = document.getElementById('speaker-name');
    this.dialogueText  = document.getElementById('dialogue-text');
    this.choiceArea    = document.getElementById('choice-area');

    this.sceneKey   = null;
    this.scene      = null;
    this.stepIndex  = 0;
    this.waiting    = false;

    // 외부 콜백
    this.onSceneEnd = null;  // (sceneKey, next) => void
    this.onChoice   = null;  // (nextKey) => void

    // 입력 이벤트
    this.textboxWrap.addEventListener('click',   () => this._advance());
    this.cutsceneLayer.addEventListener('click', () => this._advance());
    document.addEventListener('keydown', e => {
      if (e.code === 'Space' || e.code === 'Enter') this._advance();
    });
  }

  // ── 공개 메서드 ────────────────────────────────────────────────────

  loadScene(key) {
    this.sceneKey  = key;
    this.scene     = SCENES[key];
    this.stepIndex = 0;
    this.waiting   = false;

    if (!this.scene) {
      console.error(`씬을 찾을 수 없음: ${key}`);
      return;
    }
    this._next();
  }

  hide() {
    this.textboxWrap.classList.add('hidden');
    this.choiceArea.classList.add('hidden');
    this.cutsceneLayer.classList.add('hidden');
  }

  // ── 내부: 진행 ──────────────────────────────────────────────────────

  _advance() {
    if (!this.waiting) return;
    this.waiting = false;

    // 컷신 닫기
    if (!this.cutsceneLayer.classList.contains('hidden')) {
      this.cutsceneLayer.classList.add('hidden');
      this._next();
      return;
    }
    // 텍스트 박스 닫기
    if (!this.textboxWrap.classList.contains('hidden')) {
      this._next();
    }
  }

  _next() {
    const { scene } = this;
    if (!scene) return;

    // steps 소진 → 선택지 또는 씬 종료
    if (this.stepIndex >= scene.steps.length) {
      this.textboxWrap.classList.add('hidden');
      if (scene.choices) {
        this._showChoices(scene.choices);
      } else {
        if (this.onSceneEnd) this.onSceneEnd(this.sceneKey, scene.next);
      }
      return;
    }

    this._processStep(scene.steps[this.stepIndex++]);
  }

  _processStep(step) {
    switch (step.type) {
      case 'bg':
        this._setBg(step.key);
        this._next();
        break;

      case 'standing':
        this._setStanding(step.slot, step.key);
        this._next();
        break;

      case 'hide':
        this._hideStanding(step.slot);
        this._next();
        break;

      case 'text':
        this._showText(step.speaker, step.text);
        break;

      case 'cutscene':
        this._showCutscene(step.key, step.label || '');
        break;

      default:
        this._next();
    }
  }

  // ── 내부: 렌더링 ────────────────────────────────────────────────────

  _setBg(key) {
    const src = ASSETS.images[key];
    const img = new Image();
    img.onload  = () => { this.bgEl.style.backgroundImage = `url('${src}')`; };
    img.onerror = () => {
      // 이미지 없을 때: key에 따른 배경색
      const fallback = {
        bg_palace: '#1a1005', bg_hall: '#0e1520',
        bg_garden: '#0a160a', bg_corridor: '#1a1408',
      };
      this.bgEl.style.backgroundImage = 'none';
      this.bgEl.style.backgroundColor = fallback[key] || '#0d0a08';
    };
    img.src = src;
  }

  _setStanding(slot, key) {
    const el  = slot === 'left' ? this.standingLeft : this.standingRight;
    const src = ASSETS.images[key] || '';
    el.src = src;
    el.style.display = '';
    el.onerror = () => { el.style.display = 'none'; };
    el.onload  = () => { el.style.display = ''; };
  }

  _hideStanding(slot) {
    const el = slot === 'left' ? this.standingLeft : this.standingRight;
    el.src = '';
    el.style.display = 'none';
  }

  _showText(speaker, text) {
    this.cutsceneLayer.classList.add('hidden');
    this.choiceArea.classList.add('hidden');
    this.textboxWrap.classList.remove('hidden');
    this.speakerName.textContent = speaker || '';
    this.dialogueText.textContent = text;
    this.waiting = true;
  }

  _showCutscene(key, label) {
    this.textboxWrap.classList.add('hidden');
    this.cutsceneLayer.classList.remove('hidden');
    const src = ASSETS.images[key];
    this.cutsceneImg.style.display = '';
    this.cutscenePH.textContent = '';
    this.cutsceneImg.src = src;
    this.cutsceneImg.onerror = () => {
      this.cutsceneImg.style.display = 'none';
      this.cutscenePH.textContent = label || `[ 컷신: ${key} ]`;
    };
    this.waiting = true;
  }

  _showChoices(choices) {
    this.choiceArea.classList.remove('hidden');
    this.choiceArea.innerHTML = '';
    choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className   = 'choice-btn';
      btn.textContent = choice.text;
      btn.addEventListener('click', () => {
        this.choiceArea.classList.add('hidden');
        if (this.onChoice) this.onChoice(choice.next);
      });
      this.choiceArea.appendChild(btn);
    });
  }
}
