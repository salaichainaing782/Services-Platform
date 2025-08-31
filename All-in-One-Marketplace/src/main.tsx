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
import { ClerkProvider } from '@clerk/clerk-react' // ClerkProvider ကို import လုပ်ပါ

// .env ဖိုင်ထဲက key ကို import လုပ်ပါ
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)