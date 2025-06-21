import { useEffect, useRef, useState, useCallback } from 'react';

export function useSpeechRecognition({ onCommand, active }) {
  const recognitionRef = useRef(null);
  const isStartingRef = useRef(false);
  const restartTimeoutRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, []);

  const startRecognition = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec || isStartingRef.current || listening) return;

    try {
      isStartingRef.current = true;
      rec.start();
      console.log('Iniciando reconocimiento de voz...');
    } catch (error) {
      console.warn('Error al iniciar reconocimiento:', error.message);
      isStartingRef.current = false;
      setError(error.message);
    }
  }, [listening]);

  const stopRecognition = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    try {
      rec.stop();
      console.log('Deteniendo reconocimiento de voz...');
    } catch (error) {
      console.warn('Error al detener reconocimiento:', error.message);
    }
  }, []);

  const restartRecognition = useCallback(() => {
    if (!active) return;
    
    // Evitar reiniciar demasiado rápido
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    
    restartTimeoutRef.current = setTimeout(() => {
      if (active && !listening && !isStartingRef.current) {
        console.log('Reiniciando reconocimiento automáticamente...');
        startRecognition();
      }
    }, 1000);
  }, [active, listening, startRecognition]);

  // Inicializar API de reconocimiento
  useEffect(() => {
    const SpeechAPI = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    
    if (!SpeechAPI) {
      console.warn('API de reconocimiento de voz no disponible');
      setError('API de reconocimiento de voz no disponible');
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechAPI();
      
      // Configuración optimizada
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = navigator.language || 'es-ES';
      recognition.maxAlternatives = 1;

      // Event handlers
      recognition.onstart = () => {
        console.log('Reconocimiento iniciado');
        isStartingRef.current = false;
        setListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        console.log('Resultado de reconocimiento:', event);
        
        // Procesar solo resultados finales
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            const transcript = result[0].transcript.trim().toLowerCase();
            console.log('Comando reconocido:', transcript);
            
            if (transcript && onCommand) {
              onCommand(transcript);
            }
          }
        }
      };

      recognition.onend = () => {
        console.log('Reconocimiento terminado');
        isStartingRef.current = false;
        setListening(false);
        
        // Auto-restart si está activo
        if (active) {
          restartRecognition();
        }
      };

      recognition.onerror = (event) => {
        console.error('Error de reconocimiento:', event.error);
        isStartingRef.current = false;
        setListening(false);
        
        const errorMessage = event.error;
        
        // Manejar diferentes tipos de errores
        switch (errorMessage) {
          case 'no-speech':
            console.log('No se detectó habla, reiniciando...');
            if (active) restartRecognition();
            break;
          case 'audio-capture':
            setError('Error de captura de audio. Verifica tu micrófono.');
            break;
          case 'not-allowed':
            setError('Permiso de micrófono denegado.');
            break;
          case 'network':
            setError('Error de red. Verifica tu conexión.');
            break;
          case 'aborted':
            console.log('Reconocimiento abortado');
            break;
          default:
            if (active) {
              console.log(`Error ${errorMessage}, reiniciando...`);
              restartRecognition();
            }
            break;
        }
      };

      recognition.onnomatch = () => {
        console.log('No se encontró coincidencia');
        if (active) restartRecognition();
      };

      recognitionRef.current = recognition;
    }
  }, [onCommand, active, restartRecognition]);

  // Controlar inicio/parada basado en el estado activo
  useEffect(() => {
    if (active && !listening && !isStartingRef.current) {
      startRecognition();
    } else if (!active && listening) {
      stopRecognition();
    }
  }, [active, listening, startRecognition, stopRecognition]);

  return { 
    listening, 
    error,
    startRecognition,
    stopRecognition
  };
} 