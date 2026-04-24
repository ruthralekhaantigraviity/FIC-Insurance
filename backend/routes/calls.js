import express from 'express';
import mongoose from 'mongoose';
import Call from '../models/Call.js';
import User from '../models/User.js';
import DailyReport from '../models/DailyReport.js';
import { authGuard } from '../middleware/auth.js';
import { allowRoles } from '../middleware/roles.js';

const router = express.Router();
router.use(authGuard);

// @route   POST api/calls
// @desc    Record a new call
router.post('/', async (req, res) => {
  try {
    const { status, isPaid, notes, duration } = req.body;
    const call = new Call({
      employee: req.user._id,
      status,
      isPaid: isPaid || false,
      notes,
      duration
    });
    await call.save();
    res.status(201).json(call);
  } catch (err) {
    res.status(500).json({ message: 'Failed to record call' });
  }
});

// @route   GET api/calls/stats
// @desc    Get call statistics for dashboard
router.get('/stats', async (req, res) => {
  try {
    const { branch, teamLeader, date } = req.query;
    const todayStart = date ? new Date(date) : new Date();
    todayStart.setHours(0,0,0,0);
    const todayEnd = date ? new Date(date) : new Date();
    todayEnd.setHours(23,59,59,999);
    let employeeQuery = {};
    
    if (req.user.role === 'employee') {
      employeeQuery._id = req.user._id;
    } else if (req.user.role === 'team_leader') {
      employeeQuery.teamLeader = req.user._id;
    } else if (req.user.role === 'admin') {
      if (branch && branch !== 'All') {
        employeeQuery.branch = branch;
      }
      if (teamLeader) {
        employeeQuery.teamLeader = teamLeader;
      }
    }

    // Find relevant employees
    const employees = await User.find(employeeQuery).select('_id name');
    const employeeIds = employees.map(e => e._id);

    // Fetch calls for these employees
    const matchStage = { employee: { $in: employeeIds } };
    
    // Aggregation from individual Call records
    const callStats = await Call.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalCalls: { $sum: 1 },
          interested: { $sum: { $cond: [{ $eq: ['$status', 'interested'] }, 1, 0] } },
          notInterested: { $sum: { $cond: [{ $eq: ['$status', 'not_interested'] }, 1, 0] } },
          unreachable: { $sum: { $cond: [{ $eq: ['$status', 'unreachable'] }, 1, 0] } },
          paidCalls: { $sum: { $cond: [{ $eq: ['$isPaid', true] }, 1, 0] } },
          nonPaidCalls: { $sum: { $cond: [{ $eq: ['$isPaid', false] }, 1, 0] } },
        }
      }
    ]);

    // Aggregation from DailyReport records (manual entries) for Selected Date


    const reportStats = await DailyReport.aggregate([
      { $match: { user: { $in: employeeIds }, createdAt: { $gte: todayStart, $lte: todayEnd } } },
      {
        $group: {
          _id: null,
          totalCalls: { $sum: '$statsSnapshot.totalCalls' },
          interested: { $sum: '$statsSnapshot.interested' },
          notInterested: { $sum: '$statsSnapshot.notInterested' },
          notPicking: { $sum: '$statsSnapshot.notPicking' },
          paidCalls: { $sum: '$statsSnapshot.paid' },
          nonPaidCalls: { $sum: '$statsSnapshot.nonPaid' },
          completed: { $sum: '$statsSnapshot.completed' }
        }
      }
    ]);

    const r = reportStats[0] || {};
    const c = callStats[0] || {};

    const combinedStats = {
      totalCalls: (c.totalCalls || 0) + (r.totalCalls || 0),
      interested: (c.interested || 0) + (r.interested || 0),
      notInterested: (c.notInterested || 0) + (r.notInterested || 0),
      unreachable: (c.unreachable || 0) + (r.notPicking || 0),
      paidCalls: (c.paidCalls || 0) + (r.paidCalls || 0),
      nonPaidCalls: (c.nonPaidCalls || 0) + (r.nonPaidCalls || 0),
      completed: r.completed || 0
    };
    
    // Employee breakdown from individual calls
    const employeeBreakdown = await Call.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$employee',
          totalCalls: { $sum: 1 },
          interested: { $sum: { $cond: [{ $eq: ['$status', 'interested'] }, 1, 0] } },
          paidCalls: { $sum: { $cond: [{ $eq: ['$isPaid', true] }, 1, 0] } },
        }
      }
    ]);

    // Format breakdown
    const breakdownWithNames = employeeBreakdown.map(b => {
      const emp = employees.find(e => e._id.toString() === b._id.toString());
      return {
        ...b,
        employeeName: emp ? emp.name : 'Unknown'
      };
    });

    res.json({
      summary: combinedStats,
      employeeBreakdown: breakdownWithNames
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch call stats' });
  }
});

export default router;
