// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import { Toaster } from 'react-hot-toast'
// import App from './App'
// import './index.css'

// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <Toaster position="top-right" />
//     <App />
//   </React.StrictMode>,
// ) 

// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)