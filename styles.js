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

  #rules p {
    margin: 0.5em 0;
    font-size: 0.9em;
  }
`;
document.head.appendChild(style);
