// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from '@/App';
// import '@/index.css';
// import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <BrowserRouter> {/* Wrap your App component with BrowserRouter */}
//       <App />
//     </BrowserRouter>
//   </React.StrictMode>
// );

// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from '@/App';
// import '@/index.css';
// import { BrowserRouter } from 'react-router-dom';
// import { ProjectProvider } from '@/contexts/ProjectContext'; // ✅ import provider

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <ProjectProvider> {/* ✅ wrap App with provider */}
//         <App />
//       </ProjectProvider>
//     </BrowserRouter>
//   </React.StrictMode>
// );

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { BrowserRouter } from 'react-router-dom';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { AuthProvider } from '@/contexts/AuthContext'; // ✅ import AuthProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* ✅ Wrap everything with AuthProvider */}
        <ProjectProvider> {/* ✅ Keep ProjectProvider nested */}
          <App />
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
