import express from 'express'
import Task from '../models/Task.js'
import { authGuard } from '../middleware/auth.js'
import { allowRoles } from '../middleware/roles.js'

const router = express.Router()
router.use(authGuard)

// @route   GET api/tasks
// @desc    Get tasks based on role
router.get('/', async (req, res) => {
  try {
    let query = {}
    if (req.user.role === 'employee') {
      query = { assignedTo: req.user._id }
    } else if (req.user.role === 'team_leader') {
      // TL sees tasks they created or tasks assigned to them
      query = { $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }] }
    }
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST api/tasks
// @desc    Create/Assign task (Admin/TL)
router.post('/', allowRoles('admin', 'team_leader'), async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, priority } = req.body
    if (!title || !assignedTo) {
      return res.status(400).json({ message: 'Title and assignee are required' })
    }
    const task = new Task({ 
      title, 
      description, 
      assignedTo, 
      dueDate, 
      priority: priority || 'medium',
      createdBy: req.user._id 
    })
    await task.save()
    const populatedTask = await task.populate('assignedTo', 'name email')
    res.status(201).json(populatedTask)
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task' })
  }
})

// @route   PUT api/tasks/:id
// @desc    Update task status or details
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) return res.status(404).json({ message: 'Task not found' })

    const isAdmin = req.user.role === 'admin'
    const isCreator = task.createdBy?.toString() === req.user._id.toString()
    const isAssignee = task.assignedTo.toString() === req.user._id.toString()

    if (!isAdmin && !isCreator && !isAssignee) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // If only assignee and not creator/admin, only allow status update
    if (isAssignee && !isAdmin && !isCreator) {
      if (req.body.status) {
        task.status = req.body.status
      } else {
        return res.status(403).json({ message: 'Employees can only update task status' })
      }
    } else {
      // Admin or Creator can update everything
      Object.assign(task, req.body)
    }

    await task.save()
    const updatedTask = await Task.findById(req.params.id).populate('assignedTo', 'name email')
    res.json(updatedTask)
  } catch (err) {
    res.status(500).json({ message: 'Update failed' })
  }
})

// @route   DELETE api/tasks/:id
// @desc    Delete task (Admin/Creator)
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) return res.status(404).json({ message: 'Task not found' })

    if (req.user.role !== 'admin' && task.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admins or the creator can delete this task' })
    }

    await task.deleteOne()
    res.json({ message: 'Task deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' })
  }
})

export default router
