import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import leadRoutes from './routes/leads.js'
import taskRoutes from './routes/tasks.js'
import announcementRoutes from './routes/announcements.js'
import paymentRoutes from './routes/payments.js'
import reportRoutes from './routes/reports.js'
import seedRoutes from './routes/seed.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fic-crm'
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/leads', leadRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/announcements', announcementRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/seed', seedRoutes)

app.get('/', (req, res) => {
  res.send('FIC Insurance CRM API is running...')
})

const PORT = process.env.PORT || 5000
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please terminate existing sessions or use a different port.`)
    process.exit(1)
  } else {
    console.error('Server startup error:', err)
  }
})
