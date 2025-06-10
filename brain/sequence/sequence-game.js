const tones = [220, 247, 262, 294, 330, 349, 392, 440, 494];

class SequenceGame extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.sequence = [];
    this.userInput = [];
    this.score = 0;
    this.flashing = false;
    this.best = parseInt(localStorage.getItem('sequence-best') || '0', 10);
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  connectedCallback() {
    this.render();
    this.start();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          max-width: 400px;
        }
        .score {
          margin: 0.5em 0;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .cell {
          background: #eee;
          padding-bottom: 100%;
          position: relative;
          border-radius: 4px;
          cursor: pointer;
        }
        .cell.active {
          background: var(--accent-color);
        }
        .message {
          margin-top: 1em;
          min-height: 1.2em;
        }
      </style>
      <div class="score">Score: <span id="score">0</span> | Best: <span id="best">${this.best}</span></div>
      <div class="grid">
        ${Array.from({ length: 9 })
          .map((_, i) => `<div class="cell" data-index="${i}"></div>`)
          .join('')}
      </div>
      <div class="message" id="message"></div>
    `;
    this.shadowRoot
      .querySelectorAll('.cell')
      .forEach((c) => c.addEventListener('click', (e) => this.handleClick(e)));
  }

  start() {
    this.sequence = [];
    this.score = 0;
    this.best = parseInt(localStorage.getItem('sequence-best') || '0', 10);
    this.updateScore();
    this.nextRound();
  }

  async nextRound() {
    this.userInput = [];
    this.sequence.push(Math.floor(Math.random() * 9));
    await this.sleep(600);
    await this.showSequence();
  }

  async showSequence() {
    this.flashing = true;
    for (const idx of this.sequence) {
      await this.flash(idx);
    }
    this.flashing = false;
  }

  flash(index) {
    const cell = this.shadowRoot.querySelector(`.cell[data-index="${index}"]`);
    return new Promise((resolve) => {
      cell.classList.add('active');
      this.playTone(index);
      setTimeout(() => {
        cell.classList.remove('active');
        setTimeout(resolve, 200);
      }, 500);
    });
  }

  handleClick(e) {
    if (this.flashing) return;
    const index = parseInt(e.target.dataset.index, 10);
    this.userInput.push(index);
    this.flash(index);
    if (index !== this.sequence[this.userInput.length - 1]) {
      this.gameOver();
      return;
    }
    if (this.userInput.length === this.sequence.length) {
      this.score++;
      this.updateScore();
      this.nextRound();
    }
  }

  gameOver() {
    const msg = this.shadowRoot.getElementById('message');
    if (this.score > this.best) {
      this.best = this.score;
      localStorage.setItem('sequence-best', this.best);
      this.shadowRoot.getElementById('best').textContent = this.best;
    }
    msg.textContent = 'Wrong! Click to restart.';
    this.shadowRoot.querySelectorAll('.cell').forEach((c) => {
      c.addEventListener(
        'click',
        () => {
          msg.textContent = '';
          this.start();
        },
        { once: true }
      );
    });
  }

  updateScore() {
    this.shadowRoot.getElementById('score').textContent = this.score;
    this.shadowRoot.getElementById('best').textContent = this.best;
  }

  playTone(index) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.frequency.value = tones[index];
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start();
    gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.4);
    osc.stop(this.audioCtx.currentTime + 0.4);
  }

  sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
}

customElements.define('sequence-game', SequenceGame);
