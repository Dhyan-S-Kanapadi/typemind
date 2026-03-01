import React from 'react'
import { createRoot } from 'react-dom/client'
import FloatingPanel from '../components/Floatingpanel'

// Create a container that won't interfere with the host page
const container = document.createElement('div')
container.id = 'ai-context-assistant-root'

// Inject into the page
document.body.appendChild(container)

// Mount React panel into it
const root = createRoot(container)
root.render(<FloatingPanel />)