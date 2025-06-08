class SequenceGame extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.sequence = [];
    this.userInput = [];
    this.score = 0;
    this.flashing = false;
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
          background: #5da9e9;
        }
        .message {
          margin-top: 1em;
          min-height: 1.2em;
        }
      </style>
      <div class="score">Score: <span id="score">0</span></div>
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
  }

  sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
}

customElements.define('sequence-game', SequenceGame);
