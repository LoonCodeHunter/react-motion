import * as React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.js';
const root=document.getElementById('root');
if(!root)throw new Error('Showcase root was not found');
createRoot(root).render(React.createElement(React.StrictMode,null,React.createElement(App)));
