import Groq from 'groq-sdk'
import dotenv from 'dotenv'

dotenv.config()

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

function buildPrompt(text, mode) {
  const prompts = {
    grammar: `Fix the grammar, spelling, capitalization and punctuation of this text. 
Return ONLY the corrected text, nothing else, no explanations.
Text: ${text}`,

    rewrite: `Rewrite this text to be clearer, more professional and better structured.
Return ONLY the rewritten text, nothing else, no explanations.
Text: ${text}`,

    reply: `Generate 2 professional reply options for this message.
Format your response EXACTLY like this:
REPLY1: [first reply here]
REPLY2: [second reply here]
Message: ${text}`,

    code: `Fix and improve this code. Add error handling if missing.
Return ONLY the improved code, no explanations.
Code: ${text}`
  }

  return prompts[mode] || prompts.rewrite
}

export async function getSuggestion(req, res) {
  try {
    const { text, mode } = req.body

    if (!text || !mode) {
      return res.status(400).json({
        error: 'Missing required fields: text and mode'
      })
    }

    if (text.trim().length === 0) {
      return res.status(400).json({
        error: 'Text cannot be empty'
      })
    }

    console.log(`Processing ${mode} request for: "${text.substring(0, 50)}..."`)

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are TypeMind, an AI writing assistant built into a Chrome extension.
You help users improve their writing in Gmail, WhatsApp, GitHub and other websites.
Always be concise and return only what is asked. No extra commentary.`
        },
        {
          role: 'user',
          content: buildPrompt(text, mode)
        }
      ],
      temperature: 0.7,
      max_tokens: 1024,
    })

    const rawResponse = completion.choices[0]?.message?.content || ''

    if (mode === 'reply') {
      const reply1Match = rawResponse.match(/REPLY1:\s*(.+?)(?=REPLY2:|$)/s)
      const reply2Match = rawResponse.match(/REPLY2:\s*(.+?)$/s)

      return res.status(200).json({
        success: true,
        data: [
          {
            type: 'reply',
            suggestion: reply1Match ? reply1Match[1].trim() : rawResponse,
            explanation: 'Professional reply'
          },
          {
            type: 'reply',
            suggestion: reply2Match ? reply2Match[1].trim() : 'Thanks, will get back to you soon.',
            explanation: 'Concise reply'
          }
        ]
      })
    }

    const explanation = {
      grammar: 'Grammar and punctuation corrected.',
      rewrite: 'Rewritten for clarity and professionalism.',
      code: 'Code improved with better error handling.',
    }[mode] || 'Improved version of your text.'

    return res.status(200).json({
      success: true,
      data: [{
        type: mode,
        suggestion: rawResponse.trim(),
        explanation
      }]
    })

  } catch (error) {
    console.error('Groq API Error:', error.message)

    if (error.status === 401) {
      return res.status(401).json({ error: 'Invalid Groq API key' })
    }
    if (error.status === 429) {
      return res.status(429).json({ error: 'Rate limit reached. Try again in a moment.' })
    }

    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}