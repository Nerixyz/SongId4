import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

let el = document.getElementById('song-id-root');
if (!el) {
  el = document.createElement('div');
  el.id = 'song-id-root';
  el.style.display = 'flex';
  el.style.flexFlow = 'column';
  el.style.width = '100vw';
  el.style.position = 'fixed';
  el.style.top = '0';
  el.style.left = '0';
  el.style.boxSizing = 'border-box';
  el.style.zIndex = '999999999';
  el.style.position = 'fixed';
  el.style.fontSize = '20px';

  document.body.prepend(el);
}

ReactDOM.render(<App />, el);
