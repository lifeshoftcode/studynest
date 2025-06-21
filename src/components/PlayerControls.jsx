import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Slider, Progress, Dropdown, Select, Checkbox } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMicrophone, 
  faBackward, 
  faPlay, 
  faPause, 
  faForward, 
  faRedo,
  faCog,
  faSave 
} from '@fortawesome/free-solid-svg-icons';

const ControlsWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ dark }) => (dark ? '#1a1a1a' : '#fff')};
  border-top: 1px solid ${({ dark }) => (dark ? '#333' : '#e8e8e8')};
  padding: 12px 24px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const ProgressWrapper = styled.div`
  margin-bottom: 12px;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const MainControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SecondaryControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
`;

const IconButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  
  &.primary {
    width: 48px;
    height: 48px;
  }
  
  &.active {
    background: #1890ff;
    border-color: #1890ff;
    color: white;
  }
  
  &.listening {
    background: #ff4d4f !important;
    border-color: #ff4d4f !important;
    color: white !important;
    animation: pulse 1.5s infinite;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const SettingsPanel = styled.div`
  width: 300px;
  padding: 16px;
  
  .setting-item {
    margin-bottom: 16px;
    
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }
  }
`;

export default function PlayerControls({
  // Estado
  isPlaying,
  isListening,
  hasText,
  progress,
  
  // Configuración
  voices,
  selectedVoice,
  speechRate,
  speechPitch,
  chunkSize,
  darkMode,
  fontSize,
  
  // Acciones
  onPlay,
  onPause,
  onPrevious,
  onNext,
  onRepeat,
  onToggleListening,
  onProgressClick,
  onSave,
  
  // Configuración callbacks
  onVoiceChange,
  onRateChange,
  onPitchChange,
  onChunkSizeChange,
  onDarkModeChange,
  onFontSizeChange,
}) {
  const [settingsVisible, setSettingsVisible] = useState(false);

  const settingsMenu = {
    items: [{
      key: 'settings',
      label: (
        <SettingsPanel>
          <div className="setting-item">
            <label>Voz:</label>
            <Select
              value={selectedVoice}
              onChange={onVoiceChange}
              style={{ width: '100%' }}
              placeholder="Automática"
            >
              <Select.Option value="">Automática</Select.Option>
              {voices.map((v) => (
                <Select.Option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </Select.Option>
              ))}
            </Select>
          </div>

          <div className="setting-item">
            <label>Velocidad: {speechRate.toFixed(1)}x</label>
            <Slider
              min={0.5}
              max={2}
              step={0.1}
              value={speechRate}
              onChange={onRateChange}
            />
          </div>

          <div className="setting-item">
            <label>Tono: {speechPitch.toFixed(1)}</label>
            <Slider
              min={0}
              max={2}
              step={0.1}
              value={speechPitch}
              onChange={onPitchChange}
            />
          </div>

          <div className="setting-item">
            <label>Palabras por chunk: {chunkSize}</label>
            <Slider
              min={3}
              max={10}
              value={chunkSize}
              onChange={onChunkSizeChange}
            />
          </div>

          <div className="setting-item">
            <label>Tamaño de letra: {fontSize}px</label>
            <Slider
              min={16}
              max={72}
              step={2}
              value={fontSize}
              onChange={onFontSizeChange}
            />
          </div>

          <div className="setting-item">
            <Checkbox checked={darkMode} onChange={(e) => onDarkModeChange(e.target.checked)}>
              Modo oscuro
            </Checkbox>
          </div>
        </SettingsPanel>
      )
    }]
  };

  return (
    <ControlsWrapper dark={darkMode}>
      <ProgressWrapper>
        <Progress
          percent={progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0}
          showInfo={false}
          strokeColor="#1890ff"
          style={{ cursor: hasText ? 'pointer' : 'default' }}
          onClick={hasText ? onProgressClick : undefined}
        />
      </ProgressWrapper>

      <ButtonsWrapper>
        <MainControls>
          <IconButton
            type={isListening ? 'primary' : 'default'}
            danger={isListening}
            className={isListening ? 'active listening' : ''}
            disabled={!hasText}
            onClick={onToggleListening}
            title={isListening ? 'Micrófono ACTIVO - Click para desactivar' : 'Activar reconocimiento de voz'}
          >
            <FontAwesomeIcon icon={faMicrophone} />
          </IconButton>

          <IconButton
            disabled={!hasText}
            onClick={onPrevious}
            title="Anterior"
          >
            <FontAwesomeIcon icon={faBackward} />
          </IconButton>

          <IconButton
            type="primary"
            className="primary"
            disabled={!hasText}
            onClick={isPlaying ? onPause : onPlay}
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
          </IconButton>

          <IconButton
            disabled={!hasText}
            onClick={onNext}
            title="Siguiente"
          >
            <FontAwesomeIcon icon={faForward} />
          </IconButton>

          <IconButton
            disabled={!hasText}
            onClick={onRepeat}
            title="Repetir"
          >
            <FontAwesomeIcon icon={faRedo} />
          </IconButton>
        </MainControls>

        <SecondaryControls>
          <Dropdown
            menu={settingsMenu}
            trigger={['click']}
            open={settingsVisible}
            onOpenChange={setSettingsVisible}
            placement="topRight"
          >
            <IconButton title="Configuración">
              <FontAwesomeIcon icon={faCog} />
            </IconButton>
          </Dropdown>

          <IconButton
            disabled={!hasText}
            onClick={onSave}
            title="Guardar guion"
          >
            <FontAwesomeIcon icon={faSave} />
          </IconButton>
        </SecondaryControls>
      </ButtonsWrapper>
    </ControlsWrapper>
  );
} 