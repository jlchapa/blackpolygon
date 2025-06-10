export function addProgress() {
  const key = 'progress';
  const data = JSON.parse(localStorage.getItem(key) || '{}');
  const today = new Date().toISOString().slice(0, 10);
  data[today] = (data[today] || 0) + 1;
  localStorage.setItem(key, JSON.stringify(data));
}

export function getProgress() {
  const key = 'progress';
  return JSON.parse(localStorage.getItem(key) || '{}');
}
