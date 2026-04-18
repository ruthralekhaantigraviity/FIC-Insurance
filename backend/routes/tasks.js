import express from 'express'
import Task from '../models/Task.js'
import { authGuard } from '../middleware/auth.js'

const router = express.Router()
router.use(authGuard)

router.get('/', async (req, res) => {
  const query = req.user.role === 'admin' ? {} : { assignedTo: req.user._id }
  const tasks = await Task.find(query).populate('assignedTo', 'name email')
  res.json(tasks)
})

router.post('/', async (req, res) => {
  const { title, description, assignedTo, dueDate } = req.body
  if (!title || !assignedTo) {
    return res.status(400).json({ message: 'Title and assignee are required' })
  }
  const task = new Task({ title, description, assignedTo, dueDate, createdBy: req.user._id })
  await task.save()
  res.status(201).json(task)
})

router.put('/:id', async (req, res) => {
  const task = await Task.findById(req.params.id)
  if (!task) return res.status(404).json({ message: 'Task not found' })
  if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Access denied' })
  }
  Object.assign(task, req.body)
  await task.save()
  res.json(task)
})

router.delete('/:id', async (req, res) => {
  const task = await Task.findById(req.params.id)
  if (!task) return res.status(404).json({ message: 'Task not found' })
  if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Access denied' })
  }
  await task.remove()
  res.json({ message: 'Task deleted' })
})

export default router
