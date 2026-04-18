import express from 'express'
import Announcement from '../models/Announcement.js'
import { authGuard } from '../middleware/auth.js'
import { allowRoles } from '../middleware/roles.js'

const router = express.Router()
router.use(authGuard)

router.get('/', async (req, res) => {
  let query = {}
  if (req.user.role !== 'admin') {
    query = { visibleTo: { $in: ['all', req.user.role] } }
  }
  const announcements = await Announcement.find(query).sort({ createdAt: -1 })
  res.json(announcements)
})

router.post('/', allowRoles('admin'), async (req, res) => {
  const { title, message, visibleTo } = req.body
  if (!title || !message) {
    return res.status(400).json({ message: 'Title and message are required' })
  }
  const announcement = new Announcement({ title, message, visibleTo })
  await announcement.save()
  res.status(201).json(announcement)
})

router.delete('/:id', allowRoles('admin'), async (req, res) => {
  const announcement = await Announcement.findByIdAndDelete(req.params.id)
  if (!announcement) return res.status(404).json({ message: 'Announcement not found' })
  res.json({ message: 'Announcement removed' })
})

export default router
