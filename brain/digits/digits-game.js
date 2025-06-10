class DigitsGame extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.sequence = '';
    this.input = '';
    this.score = 0;
    this.round = 1;
    this.showing = false;
    this.best = parseInt(localStorage.getItem('digits-best') || '0', 10);
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
        .digits {
          font-size: 2em;
          letter-spacing: 0.2em;
          min-height: 1.5em;
          color: var(--accent-color);
        }
        input {
          font-size: 1em;
          padding: 0.5em;
          margin-top: 1em;
        }
        .message {
          margin-top: 1em;
          min-height: 1.2em;
        }
      </style>
      <div class="score">Score: <span id="score">0</span> | Best: <span id="best">${this.best}</span></div>
      <div class="digits" id="digits"></div>
      <div id="inputArea">
        <input id="answer" type="text" autocomplete="off"/>
      </div>
      <div class="message" id="message"></div>
    `;
    this.answerField = this.shadowRoot.getElementById('answer');
    this.answerField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.checkAnswer();
      }
    });
  }

  start() {
    this.score = 0;
    this.round = 1;
    this.best = parseInt(localStorage.getItem('digits-best') || '0', 10);
    this.updateScore();
    this.nextRound();
  }

  async nextRound() {
    this.answerField.value = '';
    this.sequence = Array.from({ length: this.round }, () => Math.floor(Math.random() * 10)).join('');
    await this.showDigits();
  }

  async showDigits() {
    this.showing = true;
    const digitsEl = this.shadowRoot.getElementById('digits');
    digitsEl.textContent = this.sequence;
    await this.sleep(1000 + this.round * 250);
    digitsEl.textContent = '';
    this.answerField.focus();
    this.showing = false;
  }

  checkAnswer() {
    if (this.showing) return;
    const value = this.answerField.value.trim();
    if (value === this.sequence) {
      this.score++;
      this.round++;
      this.updateScore();
      this.nextRound();
    } else {
      this.gameOver();
    }
  }

  gameOver() {
    const msg = this.shadowRoot.getElementById('message');
    if (this.score > this.best) {
      this.best = this.score;
      localStorage.setItem('digits-best', this.best);
      this.shadowRoot.getElementById('best').textContent = this.best;
    }
    msg.textContent = 'Wrong! Click here or press Enter to restart.';
    const restart = () => {
      msg.textContent = '';
      this.start();
    };
    msg.addEventListener('click', restart, { once: true });
    const keyHandler = (e) => {
      if (e.key === 'Enter') {
        msg.removeEventListener('click', restart);
        this.shadowRoot.removeEventListener('keydown', keyHandler);
        restart();
      }
    };
    this.shadowRoot.addEventListener('keydown', keyHandler);
  }

  updateScore() {
    this.shadowRoot.getElementById('score').textContent = this.score;
    this.shadowRoot.getElementById('best').textContent = this.best;
  }

  sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
}

customElements.define('digits-game', DigitsGame);
