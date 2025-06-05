// Create and inject a style element via JavaScript

const style = document.createElement('style');
style.innerHTML = `
  /* Dark mode by default */
  body {
    margin: 0;
    background-color: #121212;
    color: #e0e0e0;
    font-family: sans-serif;
  }

  /* Main container with flex layout */
  #container {
    display: flex;
    height: 100vh;
  }

  /* Fixed sidebar on the left */
  #sidebar {
    width: 220px;
    padding: 20px;
    background-color: #1e1e1e;
    box-sizing: border-box;
    overflow-y: auto;
  }

  /* Game area takes the rest of the width */
  #game-area {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #181818;
  }

  /* Canvas takes 100% of the game area width */
  #plateau {
    display: block;
    width: 100%;
    height: auto;
    border: 1px solid #444;
    background-color: #222;
  }

  h2 {
    margin-top: 0;
  }

.custom-popup {
  display: none; /* Hidden by default */
  position: fixed;
  z-index: 9999;
  left: 0; top: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.5);
  justify-content: center; align-items: center;
}

.custom-popup-content {
  background: #000000;
  padding: 2.5rem 2rem;
  border-radius: 20px;
  max-width: 700px;
  width: 90%;
  box-shadow: 0 10px 50px rgba(0,0,0,0.2);
  position: relative;
  font-size: 1.2rem;
}

.custom-popup-close {
  position: absolute; top: 18px; right: 18px;
  background: none; border: none; font-size: 2rem;
  cursor: pointer; color: #888;
}

.custom-popup-content h2 {
  margin-top: 0;
  text-align: center;
}


  #rules p {
    margin: 0.5em 0;
    font-size: 0.9em;
  }

#showRulesBtn {
  margin: 1rem;
  padding: 0.75em 2em;
  background: linear-gradient(90deg, #ff5200 0%, #ff8100 100%);
  color: #fff;
  border: none;
  border-radius: 999px;
  font-size: 1.2rem;
  font-family: inherit;
  font-weight: 700;
  letter-spacing: 1px;
  box-shadow: 0 2px 16px 0 rgba(255, 100, 0, 0.2);
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
  outline: none;
}

#showRulesBtn:hover, #showRulesBtn:focus {
  background: linear-gradient(90deg, #ff4500 0%, #ff8100 100%);
  box-shadow: 0 4px 24px 0 rgba(255, 100, 0, 0.25);
  transform: translateY(-2px) scale(1.03);
}

#showRulesBtn:active {
  background: #ff4500;
  transform: scale(0.97);
}

#game-area {
  overflow: auto;
  width: 100vw;
  background: #181818;
}

#plateau {
  display: block;
  width: auto !important;
  height: auto !important;
  max-width: none !important;
  max-height: none !important;
}

`;
document.head.appendChild(style);
