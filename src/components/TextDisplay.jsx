import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Modal, Input } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const { TextArea } = Input;

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  padding-bottom: 120px; /* Espacio para controles fijos */
  background: ${({ dark }) => (dark ? '#000' : '#fff')};
  color: ${({ dark }) => (dark ? '#fff' : '#333')};
`;

const TextContent = styled.div`
  flex: 1;
  font-family: 'Courier New', monospace;
  line-height: 1.8;
  font-size: ${({ fontSize }) => fontSize}px;
  overflow-y: auto;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid ${({ dark }) => (dark ? '#333' : '#eaeaea')};
  background: ${({ dark }) => (dark ? '#111' : '#fafafa')};
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  color: ${({ dark }) => (dark ? '#666' : '#999')};
`;

const AddButton = styled(Button)`
  width: 200px;
  height: 60px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const ChunkSpan = styled.span`
  font-size: ${({ fontSize }) => fontSize}px;
  transition: all 0.3s ease;
  
  &.current {
    color: #1890ff;
    font-weight: bold;
    background: rgba(24, 144, 255, 0.1);
    padding: 4px 6px;
    border-radius: 4px;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
  
  &.other {
    opacity: 0.7;
  }
`;

const SavedScripts = styled.div`
  margin-top: 24px;
  
  h4 {
    margin-bottom: 16px;
    color: ${({ dark }) => (dark ? '#fff' : '#333')};
  }
  
  .scripts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }
  
  .script-item {
    padding: 12px;
    border: 1px solid ${({ dark }) => (dark ? '#333' : '#d9d9d9')};
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      border-color: #1890ff;
      background: ${({ dark }) => (dark ? '#1a1a1a' : '#f0f8ff')};
    }
    
    .script-name {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .script-preview {
      font-size: 12px;
      opacity: 0.7;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
`;

export default function TextDisplay({
  hasText,
  subChunks,
  currentSub,
  fontSize,
  darkMode,
  savedScripts,
  onAddText,
  onLoadScript,
}) {
  const textRef = useRef(null);

  // Auto-scroll al chunk actual
  useEffect(() => {
    if (textRef.current && hasText) {
      const current = textRef.current.querySelector('.current');
      if (current) {
        current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentSub, hasText]);

  if (!hasText) {
    return (
      <Container dark={darkMode}>
        <EmptyState dark={darkMode}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
          <h2>No hay texto para leer</h2>
          <p>Agrega un texto para comenzar a usar el teleprompter</p>
          
          <AddButton 
            type="primary" 
            size="large"
            onClick={onAddText}
          >
            <FontAwesomeIcon icon={faPlus} />
            Agregar texto
          </AddButton>

          {savedScripts.length > 0 && (
            <SavedScripts dark={darkMode}>
              <h4>Guiones guardados</h4>
              <div className="scripts-grid">
                {savedScripts.map((script, idx) => (
                  <div 
                    key={idx} 
                    className="script-item"
                    onClick={() => onLoadScript(script.content)}
                  >
                    <div className="script-name">{script.name}</div>
                    <div className="script-preview">{script.content.substring(0, 50)}...</div>
                  </div>
                ))}
              </div>
            </SavedScripts>
          )}
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container dark={darkMode}>
      <TextContent 
        ref={textRef}
        fontSize={fontSize}
        dark={darkMode}
      >
        {subChunks.map((chunk, idx) => (
          <ChunkSpan
            key={idx}
            fontSize={fontSize}
            className={idx === currentSub ? 'current' : 'other'}
          >
            {chunk.join(' ')}{' '}
          </ChunkSpan>
        ))}
      </TextContent>
    </Container>
  );
}

// Modal para agregar texto
export function AddTextModal({ visible, onCancel, onOk }) {
  const [text, setText] = React.useState('');

  const handleOk = () => {
    if (text.trim()) {
      onOk(text);
      setText('');
    }
  };

  return (
    <Modal
      title="Agregar texto"
      visible={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Agregar"
      cancelText="Cancelar"
      width={600}
    >
      <TextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Pega o escribe tu texto aquí..."
        rows={10}
        autoFocus
      />
    </Modal>
  );
} 