import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import StatePlanning from './StatePlanning'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StatePlanning />
  </StrictMode>,
)
