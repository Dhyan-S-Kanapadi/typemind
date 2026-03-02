import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import suggestRouter from './routes/suggest.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
}))

app.use(express.json())

app.use('/api', suggestRouter)

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'TypeMind backend is running',
    timestamp: new Date().toISOString()
  })
})

app.listen(PORT, () => {
  console.log(`
  ✦ TypeMind Backend running
  ✦ Local:  http://localhost:${PORT}
  ✦ Health: http://localhost:${PORT}/health
  `)
})