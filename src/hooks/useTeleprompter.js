import { useState, useEffect, useCallback } from 'react';
import { splitLines, makeSubChunks } from '../lib/chunker';

export function useTeleprompter(text, chunkSize) {
  const [lines, setLines] = useState(() => splitLines(text));
  const [currentLine, setCurrentLine] = useState(0);
  const [subChunks, setSubChunks] = useState([]);
  const [currentSub, setCurrentSub] = useState(0);

  // recalc when text or size changes
  useEffect(() => {
    const lns = splitLines(text);
    setLines(lns);
    setCurrentLine(0);
  }, [text]);

  useEffect(() => {
    if (!lines[currentLine]) return;
    setSubChunks(makeSubChunks(lines[currentLine], chunkSize));
    setCurrentSub(0);
  }, [lines, currentLine, chunkSize]);

  const advance = useCallback(() => {
    if (currentSub < subChunks.length - 1) setCurrentSub((c) => c + 1);
    else if (currentLine < lines.length - 1) setCurrentLine((l) => l + 1);
  }, [currentSub, subChunks.length, currentLine, lines.length]);

  const back = useCallback(() => {
    if (currentSub > 0) setCurrentSub((c) => c - 1);
    else if (currentLine > 0) setCurrentLine((l) => l - 1);
  }, [currentSub, currentLine]);

  const progress = (() => {
    const completedLines = lines.slice(0, currentLine).reduce((acc, l) => acc + Math.ceil(l.split(/\s+/).filter(Boolean).length / chunkSize), 0);
    return {
      done: completedLines + currentSub + 1,
      total: lines.reduce((acc, l) => acc + Math.ceil(l.split(/\s+/).filter(Boolean).length / chunkSize), 0),
    };
  })();

  return {
    lines,
    subChunks,
    currentSub,
    currentLine,
    advance,
    back,
    progress,
    reset: () => {
      setCurrentLine(0);
      setCurrentSub(0);
    },
  };
} 