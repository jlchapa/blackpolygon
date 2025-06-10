import { getProgress } from './progress.js';

class ProgressCalendar extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    const data = getProgress();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let html = '<div class="calendar">';
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d).toISOString().slice(0, 10);
      const count = data[date] || 0;
      html += `<div class="day"><span class="num">${d}</span><span class="count">${count}</span></div>`;
    }
    html += '</div>';
    this.innerHTML = html;
  }
}

customElements.define('progress-calendar', ProgressCalendar);
