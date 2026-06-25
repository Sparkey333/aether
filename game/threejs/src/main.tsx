import { createRoot } from 'react-dom/client';
import App from '@/App';

// No StrictMode: the renderer takes over the frame loop imperatively (render targets, manual
// render). StrictMode's dev double-mount would create/destroy GL resources twice.
createRoot(document.getElementById('root')!).render(<App />);
