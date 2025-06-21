import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import PlayerControls from './components/PlayerControls';
import TextDisplay, { AddTextModal } from './components/TextDisplay';
import { useTeleprompter } from './hooks/useTeleprompter';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useVoices, speak } from './hooks/useSpeechSynthesis';
import { loadScripts, saveScript } from './lib/scriptsStorage';
import './App.css';

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ dark }) => (dark ? '#000' : '#fff')};
  color: ${({ dark }) => (dark ? '#fff' : '#333')};
`;

const DEFAULT_CHUNK_SIZE = 5;

export default function App() {
  // Estado principal
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [listeningActive, setListeningActive] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Configuración
  const [chunkSize, setChunkSize] = useState(DEFAULT_CHUNK_SIZE);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(32);
  
  // Scripts guardados
  const [savedScripts, setSavedScripts] = useState(() => loadScripts());
  
  // Hooks
  const voices = useVoices();
  const teleprompter = useTeleprompter(text, chunkSize);
  
  // Manejar comandos de voz
  const handleVoiceCommand = useCallback((command) => {
    console.log('Comando:', command);

    // Normalizar: quitar acentos y signos de puntuación
    const clean = command
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quitar diacríticos
      .replace(/[.,;!?¿¡]/g, '')
      .trim();

    if (clean.includes('siguiente')) {
      window.speechSynthesis.cancel();
      teleprompter.advance();
      setIsPlaying(true);
    } else if (clean.includes('atras') || clean.includes('anterior')) {
      window.speechSynthesis.cancel();
      teleprompter.back();
      setIsPlaying(true);
    } else if (clean.includes('repetir')) {
      // Repetir chunk actual
      if (teleprompter.subChunks[teleprompter.currentSub]) {
        const textToSpeak = teleprompter.subChunks[teleprompter.currentSub].join(' ');
        speak(textToSpeak, { voiceName: selectedVoice, rate: speechRate, pitch: speechPitch });
      }
    } else if (clean.includes('pausa')) {
      setIsPlaying(false);
      window.speechSynthesis.cancel();
    } else if (clean.includes('reanudar') || clean.includes('continua') || clean.includes('continuar')) {
      setIsPlaying(true);
    } else if (clean.includes('finalizar') || clean.includes('terminar')) {
      setIsPlaying(false);
      window.speechSynthesis.cancel();
      teleprompter.reset();
    }
  }, [teleprompter, selectedVoice, speechRate, speechPitch]);
  
  const speechRecognition = useSpeechRecognition({
    active: listeningActive,
    onCommand: handleVoiceCommand,
  });

  // Mostrar errores de reconocimiento de voz
  React.useEffect(() => {
    if (speechRecognition.error) {
      console.error('Error de reconocimiento de voz:', speechRecognition.error);
    }
  }, [speechRecognition.error]);
  
  // Reproducir chunk actual cuando cambia
  React.useEffect(() => {
    if (isPlaying && teleprompter.subChunks[teleprompter.currentSub]) {
      const textToSpeak = teleprompter.subChunks[teleprompter.currentSub].join(' ');
      speak(textToSpeak, { voiceName: selectedVoice, rate: speechRate, pitch: speechPitch });
    }
  }, [teleprompter.currentSub, isPlaying, teleprompter.subChunks, selectedVoice, speechRate, speechPitch]);
  
  // Handlers
  const handleAddText = (newText) => {
    setText(newText);
    setShowAddModal(false);
  };
  
  const handleSaveScript = () => {
    const name = prompt('Nombre del guion:');
    if (name && text.trim()) {
      const newScripts = saveScript(name, text);
      setSavedScripts(newScripts);
    }
  };
  
  const handleLoadScript = (content) => {
    setText(content);
  };
  
  const handleProgressClick = (e) => {
    // TODO: Implementar salto a posición específica
    console.log('Click en progreso:', e);
  };
  
  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (!text) return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        teleprompter.back();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        teleprompter.advance();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [text, isPlaying, teleprompter]);
  
  const hasText = Boolean(text.trim());
  
  return (
    <AppContainer dark={darkMode}>
      <TextDisplay
        hasText={hasText}
        subChunks={teleprompter.subChunks}
        currentSub={teleprompter.currentSub}
        fontSize={fontSize}
        darkMode={darkMode}
        savedScripts={savedScripts}
        onAddText={() => setShowAddModal(true)}
        onLoadScript={handleLoadScript}
      />
      
      <PlayerControls
        // Estado
        isPlaying={isPlaying}
        isListening={listeningActive}
        hasText={hasText}
        progress={teleprompter.progress}
        
        // Configuración
        voices={voices}
        selectedVoice={selectedVoice}
        speechRate={speechRate}
        speechPitch={speechPitch}
        chunkSize={chunkSize}
        darkMode={darkMode}
        fontSize={fontSize}
        
        // Acciones
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onPrevious={teleprompter.back}
        onNext={teleprompter.advance}
        onRepeat={() => {
          if (teleprompter.subChunks[teleprompter.currentSub]) {
            const textToSpeak = teleprompter.subChunks[teleprompter.currentSub].join(' ');
            speak(textToSpeak, { voiceName: selectedVoice, rate: speechRate, pitch: speechPitch });
          }
        }}
        onToggleListening={() => setListeningActive((prev) => !prev)}
        onProgressClick={handleProgressClick}
        onSave={handleSaveScript}
        
        // Configuración callbacks
        onVoiceChange={setSelectedVoice}
        onRateChange={setSpeechRate}
        onPitchChange={setSpeechPitch}
        onChunkSizeChange={setChunkSize}
        onDarkModeChange={setDarkMode}
        onFontSizeChange={setFontSize}
      />
      
      <AddTextModal
        visible={showAddModal}
        onCancel={() => setShowAddModal(false)}
        onOk={handleAddText}
      />
    </AppContainer>
  );
}
