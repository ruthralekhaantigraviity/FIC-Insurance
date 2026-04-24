import express from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import Branch from '../models/Branch.js'
import { authGuard } from '../middleware/auth.js'
import { allowRoles } from '../middleware/roles.js'

const router = express.Router()

router.use(authGuard)
// @route   GET api/users/profile
// @desc    Get current user profile (Self)
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', allowRoles('admin'), async (req, res) => {
  const users = await User.find().select('-password')
  res.json(users)
})

// @route   GET api/users/branches
// @desc    Get all unique branches (Admin/TL)
router.get('/branches', allowRoles('admin', 'team_leader'), async (req, res) => {
  try {
    const branches = await Branch.find({ isActive: true }).select('name -_id');
    res.json(branches.map(b => b.name));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch branches' });
  }
})

// @route   GET api/users/team-leaders
// @desc    Get all team leaders (Admin)
router.get('/team-leaders', allowRoles('admin'), async (req, res) => {
  try {
    const tls = await User.find({ role: 'team_leader' }).select('name email branch');
    res.json(tls);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch team leaders' });
  }
})

// @route   GET api/users/team
// @desc    Get employees in the same branch or under same TL
router.get('/team', allowRoles('admin', 'team_leader'), async (req, res) => {
  try {
    let query = { role: 'employee' };
    if (req.user.role === 'team_leader') {
      query.teamLeader = req.user._id;
    }
    const employees = await User.find(query).select('name email role branch team teamLeader').populate('teamLeader', 'name');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch team' });
  }
})

router.post('/', allowRoles('admin'), async (req, res) => {
  const { name, email, phone, role, team, branch, password, teamLeader } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' })
  }
  const normalizedEmail = String(email).trim().toLowerCase()
  const existing = await User.findOne({ email: normalizedEmail })
  if (existing) {
    return res.status(400).json({ message: 'Email already exists' })
  }
  const user = new User({ name, email: normalizedEmail, phone, role, team, branch, password, teamLeader })
  await user.save()
  res.status(201).json({ message: 'Employee created', user: { id: user._id, name, email: normalizedEmail, role, team, phone, branch, teamLeader } })
})

router.put('/:id', allowRoles('admin'), async (req, res) => {
  const updates = { ...req.body }
  // Don't hash password here, model pre-save hook handles it if modified
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  
  Object.keys(updates).forEach(key => {
    if (key === 'password' && (!updates[key] || updates[key].trim() === '')) {
      return;
    }
    user[key] = updates[key]
  })
  
  await user.save()
  const updatedUser = await User.findById(user._id).select('-password')
  res.json(updatedUser)
})

router.delete('/:id', allowRoles('admin'), async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json({ message: 'Employee deleted' })
})

export default router
