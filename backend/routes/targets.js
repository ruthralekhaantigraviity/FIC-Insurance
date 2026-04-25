import express from 'express';
import Target from '../models/Target.js';
import User from '../models/User.js';
import { authGuard } from '../middleware/auth.js';
import { allowRoles } from '../middleware/roles.js';

const router = express.Router();

// @desc    Assign or Update Target
// @route   POST /api/targets
// @access  Admin/TeamLeader
router.post('/', [authGuard, allowRoles('admin', 'team_leader')], async (req, res) => {
  const { user: targetUserId, month, premiumTarget, policyCountTarget, dailyCallTarget, followUpTarget, renewalTarget } = req.body;

  if (req.user.role === 'employee') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    // If Team Leader, check if user is in their team
    if (req.user.role === 'team_leader' && targetUser.teamLeader?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: Can only assign to team members' });
    }

    let target = await Target.findOne({ user: targetUserId, month });

    if (target) {
      if (target.locked) return res.status(400).json({ message: 'Target for this month is locked' });
      
      target.premiumTarget = premiumTarget || target.premiumTarget;
      target.policyCountTarget = policyCountTarget || target.policyCountTarget;
      target.dailyCallTarget = dailyCallTarget || target.dailyCallTarget;
      target.followUpTarget = followUpTarget || target.followUpTarget;
      target.renewalTarget = renewalTarget || target.renewalTarget;
      target.assignedBy = req.user._id;
    } else {
      target = new Target({
        user: targetUserId,
        month,
        premiumTarget,
        policyCountTarget,
        dailyCallTarget,
        followUpTarget,
        renewalTarget,
        assignedBy: req.user._id
      });
    }

    await target.save();
    res.status(201).json(target);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Get performance analytics
// @route   GET /api/targets/analytics/:month
router.get('/analytics/:month', authGuard, async (req, res) => {
  const { month } = req.params;
  const { branch, teamLeader: tlId } = req.query;

  try {
    let query = { month };
    
    // Filter by branch/TL if provided
    if (branch || tlId) {
        const usersQuery = {};
        if (branch && branch !== 'All') usersQuery.branch = branch;
        if (tlId) usersQuery.teamLeader = tlId;
        const users = await User.find(usersQuery).select('_id');
        query.user = { $in: users.map(u => u._id) };
    }

    const targets = await Target.find(query).populate('user', 'name branch role teamLeader');
    res.json(targets);
  } catch (err) {
    console.error('Targets analytics error:', err);
    res.status(500).json({ message: err.message });
  }
});

// @desc    Get Target for current user or specific user
// @route   GET /api/targets/:userId/:month
router.get('/:userId/:month', authGuard, async (req, res) => {
  try {
    if (!req.params.userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    const target = await Target.findOne({ user: req.params.userId, month: req.params.month });
    if (!target) return res.status(404).json({ message: 'Target not found' });
    res.json(target);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Lock reports for a month
// @route   POST /api/targets/lock
router.post('/lock', [authGuard, allowRoles('admin')], async (req, res) => {
  const { month } = req.body;
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only admin can lock reports' });

  try {
    await Target.updateMany({ month }, { locked: true });
    res.json({ message: `Reports for ${month} locked successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



export default router;
