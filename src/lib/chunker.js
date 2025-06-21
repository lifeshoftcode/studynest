export function splitLines(text) {
  return text.split('\n').filter((l) => l.trim() !== '');
}

export function makeSubChunks(line, size) {
  const words = line.split(/(\s+)/).filter((w) => w.trim());
  const chunks = [];
  let current = [];
  for (const w of words) {
    current.push(w);
    if (current.filter((t) => t.trim().length > 0).length === size) {
      chunks.push(current);
      current = [];
    }
  }
  if (current.length) chunks.push(current);
  return chunks;
} 