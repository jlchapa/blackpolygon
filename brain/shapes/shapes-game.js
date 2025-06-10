import { addProgress } from '../progress.js';
const tones = [220, 247, 262, 294, 330];

class ShapesGame extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.sequence = [];
    this.userInput = [];
    this.score = 0;
    this.best = parseInt(localStorage.getItem('shapes-best') || '0', 10);
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  connectedCallback() {
    this.render();
    this.start();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; max-width:400px; margin:0 auto; }
        .score { margin:0.5em 0; }
        .sequence { min-height:80px; margin:1em 0; }
        .shapes { display:flex; justify-content:space-around; }
        .shape { width:40px; height:40px; cursor:pointer; }
        .circle { border-radius:50%; background:#e74c3c; }
        .square { background:#3498db; }
        .triangle { width:0; height:0; border-left:20px solid transparent; border-right:20px solid transparent; border-bottom:40px solid #f1c40f; }
        .star { color:#9b59b6; font-size:40px; line-height:40px; }
        .diamond { transform:rotate(45deg); background:#2ecc71; width:28px; height:28px; margin-top:6px; }
      </style>
      <div class="score">Score: <span id="score">0</span> | Best: <span id="best">${this.best}</span></div>
      <div class="sequence" id="display"></div>
      <div class="shapes">
        <div class="shape circle" data-index="0"></div>
        <div class="shape square" data-index="1"></div>
        <div class="shape triangle" data-index="2"></div>
        <div class="shape star" data-index="3">★</div>
        <div class="shape diamond" data-index="4"></div>
      </div>
      <div class="message" id="message"></div>
    `;
    this.shadowRoot.querySelectorAll('.shape').forEach(el => el.addEventListener('pointerdown', e => this.handleClick(e)));
  }

  start() {
    this.sequence = [];
    this.score = 0;
    this.best = parseInt(localStorage.getItem('shapes-best') || '0', 10);
    this.updateScore();
    this.nextRound();
  }

  async nextRound() {
    this.userInput = [];
    this.sequence.push(Math.floor(Math.random() * 5));
    await this.sleep(600);
    await this.showSequence();
  }

  async showSequence() {
    for (const idx of this.sequence) {
      await this.showShape(idx);
    }
  }

  showShape(index) {
    const display = this.shadowRoot.getElementById('display');
    const clone = this.shadowRoot.querySelector(`.shape[data-index="${index}"]`).cloneNode(true);
    display.innerHTML = '';
    display.appendChild(clone);
    this.playTone(index);
    return new Promise(resolve => setTimeout(() => { display.innerHTML = ''; resolve(); }, 600));
  }

  handleClick(e) {
    const index = parseInt(e.currentTarget.dataset.index, 10);
    this.userInput.push(index);
    this.playTone(index);
    if (index !== this.sequence[this.userInput.length - 1]) {
      this.gameOver();
      return;
    }
    if (this.userInput.length === this.sequence.length) {
      this.score++;
      addProgress();
      this.updateScore();
      this.nextRound();
    }
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

  gameOver() {
    const msg = this.shadowRoot.getElementById('message');
    if (this.score > this.best) {
      this.best = this.score;
      localStorage.setItem('shapes-best', this.best);
    }
    msg.textContent = 'Wrong! Tap a shape to restart.';
    this.shadowRoot.getElementById('best').textContent = this.best;
    this.shadowRoot.querySelectorAll('.shape').forEach(el => {
      el.addEventListener('pointerdown', () => {
        msg.textContent = '';
        this.start();
      }, { once: true });
    });
  }

  updateScore() {
    this.shadowRoot.getElementById('score').textContent = this.score;
    this.shadowRoot.getElementById('best').textContent = this.best;
  }

  sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
}

customElements.define('shapes-game', ShapesGame);
