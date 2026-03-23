import React, { useEffect, useRef, useState } from 'react';
import '../css/navbar.css';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import SidebarExportButton from './Sidebar/Export_Card';

const Navbar = ({ user, onLogout, isVisible, toggleVisibility, onDataChanged }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [panelPos, setPanelPos] = useState({ x: null, y: null });
  const [panelSize, setPanelSize] = useState({ width: 320, height: 240 });

  const dragState = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const startDrag = (e) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    dragState.current = {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    setPanelPos({ x: rect.left, y: rect.top });
  };

  useEffect(() => {
    const onMove = (e) => {
      const s = dragState.current;
      if (!s) return;
      setPanelPos({
        x: e.clientX - s.offsetX,
        y: e.clientY - s.offsetY,
      });
    };

    const onUp = () => {
      dragState.current = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const handleInputKeyDown = async (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    const text = inputValue.trim();
    if (!text) return;

    const userMsg = { text, role: 'user' };
    const thinkingMsg = { text: 'Thinking…', role: 'reply', pending: true };

    const nextMessages = [...messages, userMsg, thinkingMsg];
    setMessages(nextMessages);

    setInputValue('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      const response = await api.post('/ai/chat/', {
        messages: nextMessages
          .filter((m) => !m.pending)
          .map((m) => ({
            role: m.role === 'reply' ? 'assistant' : 'user',
            content: m.text,
          })),
      });

      const reply = response.data.reply ?? '';
      const dataChanged = Boolean(response.data.dataChanged);

      setMessages((prev) =>
        prev.map((m) => (m.pending ? { text: reply, role: 'reply' } : m)),
      );

      if (dataChanged && onDataChanged) {
        await onDataChanged();
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.pending ? { text: 'Error: failed to reach AI', role: 'reply' } : m,
        ),
      );
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (!inputRef.current) return;
    inputRef.current.style.height = 'auto';
    inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
  };

  const handleResizeEnd = () => {
    if (!panelRef.current) return;
    const nextWidth = panelRef.current.offsetWidth;
    const nextHeight = panelRef.current.offsetHeight;
    if (nextWidth === panelSize.width && nextHeight === panelSize.height) return;
    setPanelSize({ width: nextWidth, height: nextHeight });
  };

  return (
    <header>
      <div className="containers">
        <nav className="navbar">
          <div className="logo" onClick={() => navigate('/')}>
            <h2>Comwrap Reply</h2>
          </div>

          <ul className="nav-link">
            <li>
                <a
                href="/employees"
                onClick={(e) => {
                    e.preventDefault();
                    navigate('/employees');
                }}
                >
                Employees
                </a>
            </li>
            <li>
                <a
                href="/projects"
                onClick={(e) => {
                    e.preventDefault();
                    navigate('/projects');
                }}
                >
                Projects
                </a>
            </li>
            <li>
                <SidebarExportButton />
            </li>
            <li>
                <a
                href="#ai"
                onClick={(e) => {
                    e.preventDefault();
                    toggleVisibility();
                }}
                >
                AI
                </a>
            </li>
            </ul>

            <ul className="right-nav-link">
            <li>
                <a
                href="#logout"
                onClick={(e) => {
                    e.preventDefault();
                    onLogout();
                }}
                >
                {user?.firstName} {user?.lastName}
                </a>
            </li>
            </ul>
        </nav>
      </div>

      {isVisible && (
        <div
          id="ai-panel"
          className="ai-panel"
          ref={panelRef}
          onMouseUp={handleResizeEnd}
          style={{
            width: panelSize.width,
            height: panelSize.height,
            left: panelPos.x ?? undefined,
            top: panelPos.y ?? undefined,
            right: panelPos.x == null ? 20 : 'auto',
          }}
        >
          <div className="ai-drag-bar" onMouseDown={startDrag} />
          <div className="ai-content">
            <div className="ai-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`ai-message ${msg.role}`}>
                  {msg.text}
                </div>
              ))}
            </div>
          </div>
          <div className="ai-input-row">
            <textarea
              className="ai-input"
              placeholder="Type here"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              rows={1}
              ref={inputRef}
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;