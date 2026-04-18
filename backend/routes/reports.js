import express from 'express'
import ExcelJS from 'exceljs'
import Lead from '../models/Lead.js'
import Task from '../models/Task.js'
import Payment from '../models/Payment.js'
import Incentive from '../models/Incentive.js'
import User from '../models/User.js'
import DailyReport from '../models/DailyReport.js'
import { authGuard } from '../middleware/auth.js'
import { allowRoles } from '../middleware/roles.js'

const router = express.Router()
router.use(authGuard)

router.get('/dashboard', async (req, res) => {
  const { branch } = req.query;
  let query = {}
  let userQuery = {}
  
  if (req.user.role === 'employee') {
    query = { assignedTo: req.user._id }
    userQuery = { _id: req.user._id }
  } else if (req.user.role === 'team_leader' || (req.user.role === 'admin' && branch && branch !== 'All')) {
    const targetBranch = (req.user.role === 'admin' && branch) ? branch : req.user.branch;
    const branchUsers = await User.find({ branch: targetBranch }).select('_id')
    const userIds = branchUsers.map(u => u._id)
    query = { assignedTo: { $in: userIds } }
    userQuery = { _id: { $in: userIds } }
  }

  const totalLeads = await Lead.countDocuments(query)
  const calledLeads = await Lead.countDocuments({ ...query, status: 'called' })
  const interestedLeads = await Lead.countDocuments({ ...query, status: 'interested' })
  const paymentLinksSent = await Lead.countDocuments({ ...query, status: 'payment_link_sent' })
  const paymentsCompleted = await Payment.countDocuments(req.user.role === 'admin' ? {} : { sentBy: { $in: query.assignedTo ? (Array.isArray(query.assignedTo.$in) ? query.assignedTo.$in : [query.assignedTo]) : [req.user._id] } })
  
  // Refined Payment count for TL
  let paymentQuery = {}
  if (req.user.role === 'team_leader') {
      const branchUsers = await User.find({ branch: req.user.branch }).select('_id')
      paymentQuery = { sentBy: { $in: branchUsers.map(u => u._id) } }
  } else if (req.user.role === 'employee') {
      paymentQuery = { sentBy: req.user._id }
  }

  const odCount = await Lead.countDocuments({ ...query, insuranceType: 'od', status: 'issued' })
  const thirdPartyCount = await Lead.countDocuments({ ...query, insuranceType: 'third_party', status: 'issued' })
  
  // Dynamic Category Stats (assuming insuranceType mapping)
  const categoryStats = [
    { name: 'Motor (OD)', value: odCount, color: '#1E3A8A' },
    { name: 'Motor (TP)', value: thirdPartyCount, color: '#10B981' },
    { name: 'Health', value: await Lead.countDocuments({ ...query, insuranceType: 'health', status: 'issued' }), color: '#F59E0B' },
    { name: 'Life', value: await Lead.countDocuments({ ...query, insuranceType: 'life', status: 'issued' }), color: '#EC4899' },
  ];

  // 7-day conversion history (AreaChart data)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0,0,0,0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23,59,59,999);
    
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const count = await Lead.countDocuments({ 
        ...query, 
        status: 'issued', 
        updatedAt: { $gte: d, $lte: dayEnd } 
    });
    last7Days.push({ name: dayName, count });
  }

  const incentiveMatch = req.user.role === 'admin' ? {} : (req.user.role === 'team_leader' ? { user: { $in: userQuery._id.$in } } : { user: req.user._id })
  
  const totalIncentives = await Incentive.aggregate([
    { $match: incentiveMatch },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ])

  const totalPremium = await Payment.aggregate([
    { $match: paymentQuery },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ])

  // Daily Top performers aggregation (Today only)
  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  const todayEnd = new Date();
  todayEnd.setHours(23,59,59,999);

  const leaderboardMatch = {
      ...(req.user.role === 'admin' ? {} : (req.user.role === 'team_leader' ? { user: { $in: Array.isArray(userQuery._id.$in) ? userQuery._id.$in : [] } } : { user: req.user._id })),
      createdAt: { $gte: todayStart, $lte: todayEnd }
  };
  
  const leaderboard = await Incentive.aggregate([
    { $match: leaderboardMatch },
    { $group: { _id: '$user', incentives: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { incentives: -1 } },
    { $limit: 5 },
  ])
  
  const topPerformers = await User.find({ _id: { $in: leaderboard.map((item) => item._id) } }).select('name email role')
  const leaderboardMap = leaderboard.reduce((acc, item) => ({ ...acc, [item._id.toString()]: item }), {})

  res.json({
    totalLeads,
    todayCallsDone: await Lead.countDocuments({ ...query, status: 'called', updatedAt: { $gte: todayStart, $lte: todayEnd } }),
    calledLeads,
    interestedLeads,
    paymentLinksSent,
    paymentsCompleted: await Payment.countDocuments(paymentQuery),
    categoryStats,
    conversionHistory: last7Days,
    totalIncentives: totalIncentives[0]?.total || 0,
    totalPremium: totalPremium[0]?.total || 0,
    dailyTopPerformers: topPerformers.map((user) => ({
      name: user.name,
      email: user.email,
      role: user.role,
      incentives: leaderboardMap[user._id.toString()]?.incentives || 0,
      conversions: leaderboardMap[user._id.toString()]?.count || 0,
    })),
  })
})

router.get('/export/leads', allowRoles('admin'), async (req, res) => {
  const leads = await Lead.find().populate('assignedTo', 'name email')
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Leads')
  sheet.columns = [
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Status', key: 'status', width: 20 },
    { header: 'Insurance Type', key: 'insuranceType', width: 15 },
    { header: 'Assigned To', key: 'assignedTo', width: 25 },
    { header: 'Created At', key: 'createdAt', width: 20 },
  ]
  leads.forEach((lead) => {
    sheet.addRow({
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      status: lead.status,
      insuranceType: lead.insuranceType,
      assignedTo: lead.assignedTo?.name,
      createdAt: lead.createdAt.toISOString(),
    })
  })
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', 'attachment; filename=leads.xlsx')
  await workbook.xlsx.write(res)
  res.end()
})

router.get('/export/performance', allowRoles('admin', 'team_leader'), async (req, res) => {
  let query = { role: { $ne: 'admin' } }
  if (req.user.role === 'team_leader') {
    query.branch = req.user.branch
  }
  const users = await User.find(query).select('name email role branch team')
  
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Performance Matrix')
  sheet.columns = [
    { header: 'Employee Name', key: 'name', width: 25 },
    { header: 'Role', key: 'role', width: 15 },
    { header: 'Branch', key: 'branch', width: 15 },
    { header: 'Team', key: 'team', width: 15 },
    { header: 'Conversions', key: 'conversions', width: 15 },
    { header: 'Premium Volume (INR)', key: 'premium', width: 20 },
    { header: 'Incentives Earned (INR)', key: 'incentives', width: 20 },
  ]

  for (const user of users) {
    const conversions = await Lead.countDocuments({ assignedTo: user._id, status: 'issued' })
    const totalPremium = await Payment.aggregate([
      { $match: { sentBy: user._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    const totalIncentives = await Incentive.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    sheet.addRow({
      name: user.name,
      role: user.role,
      branch: user.branch,
      team: user.team,
      conversions,
      premium: totalPremium[0]?.total || 0,
      incentives: totalIncentives[0]?.total || 0
    })
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', 'attachment; filename=performance_matrix.xlsx')
  await workbook.xlsx.write(res)
  res.end()
})

router.get('/activity', allowRoles('admin', 'team_leader'), async (req, res) => {
  const leads = await Lead.find({ assignedTo: req.user._id })
  const tasks = await Task.find({ assignedTo: req.user._id })
  const payments = await Payment.find({ sentBy: req.user._id })
  const incentives = await Incentive.find({ user: req.user._id })
  res.json({ leads, tasks, payments, incentives })
})

router.get('/performance', allowRoles('admin', 'team_leader'), async (req, res) => {
  let query = { role: { $ne: 'admin' } }
  if (req.user.role === 'team_leader') {
    query.branch = req.user.branch
  }
  const users = await User.find(query).select('name email role branch team')
  
  const performanceData = await Promise.all(users.map(async (user) => {
    const conversions = await Lead.countDocuments({ assignedTo: user._id, status: 'issued' })
    const totalPremium = await Payment.aggregate([
      { $match: { sentBy: user._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    const totalIncentives = await Incentive.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      team: user.team,
      conversions,
      premium: totalPremium[0]?.total || 0,
      incentives: totalIncentives[0]?.total || 0
    }
  }))

  res.json(performanceData)
})

router.post('/daily', async (req, res) => {
  try {
    const { summary, statsSnapshot } = req.body;
    const report = new DailyReport({
      user: req.user._id,
      summary,
      statsSnapshot
    });
    await report.save();
    res.json({ message: 'Daily report submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit report' });
  }
});

export default router
