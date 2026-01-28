
import React, { useEffect, useRef, useState } from 'react'

import '../css/Header.css'

const Header = ({ isVisible, toggleVisibility }) => {

const[messages, setMessages] = useState([])
const [inputValue, setInputValue] = useState('')
const [panelPos, setPanelPos] = useState({ x: null, y: null })
const dragState = useRef(null)
const inputRef = useRef(null)


const startDrag = (e) => {
  if (!panelRef.current) return
  const rect = panelRef.current.getBoundingClientRect()
  dragState.current = {
    offsetX: e.clientX - rect.left,
    offsetY: e.clientY - rect.top,
  }
  setPanelPos({ x: rect.left, y: rect.top })
}

useEffect(() => {
  const onMove = (e) => {
    const s = dragState.current
    if (!s) return
    setPanelPos({
      x: e.clientX - s.offsetX,
      y: e.clientY - s.offsetY,
    })
  }
  const onUp = () => {
    dragState.current = null
  }

  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
  return () => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
}, [])

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
  if (inputRef.current) {
    inputRef.current.style.height = 'auto'
  }
}

const handleInputChange = (e) => {
  setInputValue(e.target.value)
  if (!inputRef.current) return
  inputRef.current.style.height = 'auto'
  inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
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
          <a href="/">
          <h1>Reply <span className='span-1_Comwrap'>Comwrap</span></h1>
          </a>
        </div>
        <div className="Text-top_right">
          <h1>Joe Strummer</h1>
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
            
        </div>

        
    )
}

export default Header