// src/hooks/useTextDetector.js
import { useState, useEffect } from 'react'

export default function useTextDetector() {
  const [capturedText, setCapturedText] = useState('')
  const [activeElement, setActiveElement] = useState(null)
  const [sourceSite, setSourceSite] = useState('')

  useEffect(() => {
    function detectSite() {
      const host = window.location.hostname
      if (host.includes('mail.google.com')) return 'Gmail'
      if (host.includes('web.whatsapp.com')) return 'WhatsApp'
      if (host.includes('github.com')) return 'GitHub'
      if (host.includes('notion.so')) return 'Notion'
      if (host.includes('linkedin.com')) return 'LinkedIn'
      return 'Web'
    }

    function isValidInput(el) {
      if (!el) return false
      const tag = el.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea') return true
      if (el.isContentEditable) return true
      return false
    }

    function extractText(el) {
      if (!el) return ''
      const tag = el.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea') return el.value
      return el.innerText || el.textContent || ''
    }

    function handleInput(e) {
      if (!isValidInput(e.target)) return
      const text = extractText(e.target)
      setCapturedText(text)
      setActiveElement(e.target)
      setSourceSite(detectSite())
    }

    function handleFocus(e) {
      if (!isValidInput(e.target)) return
      const text = extractText(e.target)
      setCapturedText(text)
      setActiveElement(e.target)
      setSourceSite(detectSite())
    }

    document.addEventListener('input', handleInput, true)
    document.addEventListener('focus', handleFocus, true)

    return () => {
      document.removeEventListener('input', handleInput, true)
      document.removeEventListener('focus', handleFocus, true)
    }
  }, [])

  function applyText(newText) {
    if (!activeElement) return

    const tag = activeElement.tagName.toLowerCase()

    if (tag === 'input' || tag === 'textarea') {
      const proto = tag === 'input'
        ? window.HTMLInputElement.prototype
        : window.HTMLTextAreaElement.prototype
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
      if (setter) {
        setter.call(activeElement, newText)
      } else {
        activeElement.value = newText
      }
      activeElement.dispatchEvent(new Event('input', { bubbles: true }))

    } else if (activeElement.isContentEditable) {
      activeElement.focus()
      document.execCommand('selectAll', false, null)
      document.execCommand('insertText', false, newText)
    }

    setCapturedText(newText)
  }

  return { capturedText, setCapturedText, applyText, activeElement, sourceSite }
}