const KEY = 'scripts';

export function loadScripts() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function saveScript(name, content) {
  const list = loadScripts();
  const newList = [...list, { name, content }];
  localStorage.setItem(KEY, JSON.stringify(newList));
  return newList;
} 