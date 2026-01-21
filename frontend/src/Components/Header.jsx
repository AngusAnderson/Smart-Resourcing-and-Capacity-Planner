
import React, { useRef, useState } from 'react'

import '../css/Header.css'

const Header = ({ isVisible, toggleVisibility }) => {

const[messages, setMessages] = useState([])
const [inputValue, setInputValue] = useState('')

const handleInputKeyDown = (e) => {
  if (e.key !== 'Enter') return
  e.preventDefault()
  const text = inputValue.trim()
  if (!text) return

  setMessages((prev) => [
    ...prev,
    { text, role: 'user' },
    { text: 'OK', role: 'reply' },
  ])

  setInputValue('')
}

const panelRef = useRef(null)
const [panelSize, setPanelSize] = useState({ width: 320, height: 240 })

const handleResizeEnd = () => {
  if (!panelRef.current) return
  const nextWidth = panelRef.current.offsetWidth
  const nextHeight = panelRef.current.offsetHeight
  if (nextWidth === panelSize.width && nextHeight === panelSize.height) return
  setPanelSize({ width: nextWidth, height: nextHeight })
}
    return (
        <div className='Header'>
        <div className="Text-top_left">
          <h1>Reply <span className='span-1_Comwrap'>Comwrap</span></h1>
        </div>
        <div className="Text-top_right">
          <h1>John Doe</h1>
        </div>

        <div className="Text-middle">
          <button class="button-access-ai" onClick={toggleVisibility}>
          {isVisible ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash-lg" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8"/>
    </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
            </svg>}
            
                Access AI
            </button>
            </div>

            {isVisible && (
              <div
                id="ai-panel"
                className="ai-panel"
                ref={panelRef}
                onMouseUp={handleResizeEnd}
                style={{ width: panelSize.width, height: panelSize.height }}
              >
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
                  <input
                    className="ai-input"
                    type="text"
                    placeholder="Type here"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                  />
                </div>
                
              </div>
            )}
            
        </div>

        
    )
}

export default Header