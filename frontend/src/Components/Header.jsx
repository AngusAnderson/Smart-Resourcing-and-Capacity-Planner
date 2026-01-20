import React from 'react'
import '../css/Header.css'

const Header = ({ isVisible, toggleVisibility }) => {

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

            {isVisible && <div id="ai-panel" className="ai-panel" />}
            
        </div>

        
    )
}

export default Header