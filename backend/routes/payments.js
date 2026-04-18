import express from 'express'
import crypto from 'crypto'
import Lead from '../models/Lead.js'
import Payment from '../models/Payment.js'
import Policy from '../models/Policy.js'
import Incentive from '../models/Incentive.js'
import IncentiveSetting from '../models/IncentiveSetting.js'
import User from '../models/User.js'
import { authGuard } from '../middleware/auth.js'
import { allowRoles } from '../middleware/roles.js'

const router = express.Router()
router.use(authGuard)

router.get('/', async (req, res) => {
  const query = req.user.role === 'admin' ? {} : { sentBy: req.user._id }
  const payments = await Payment.find(query).populate('lead', 'name phone status insuranceType')
  res.json(payments)
})

router.post('/link', async (req, res) => {
  const { leadId, amount } = req.body
  if (!leadId || !amount) {
    return res.status(400).json({ message: 'Lead and amount are required' })
  }
  const lead = await Lead.findById(leadId)
  if (!lead) return res.status(404).json({ message: 'Lead not found' })
  const link = `https://payments.example.com/pay/${crypto.randomBytes(8).toString('hex')}`
  const payment = new Payment({ lead: leadId, amount, status: 'pending', method: 'payment_link', link, sentBy: req.user._id })
  await payment.save()
  lead.status = 'payment_link_sent'
  lead.history.push({ status: 'payment_link_sent', author: req.user._id, note: 'Payment link generated' })
  await lead.save()
  res.status(201).json({ payment, link })
})

router.post('/:id/complete', allowRoles('admin', 'employee', 'team_leader'), async (req, res) => {
  const payment = await Payment.findById(req.params.id)
  if (!payment) return res.status(404).json({ message: 'Payment not found' })
  payment.status = 'completed'
  payment.paidAt = new Date()
  await payment.save()
  const lead = await Lead.findById(payment.lead)
  if (lead) {
    lead.status = 'payment_received'
    lead.history.push({ status: 'payment_received', author: req.user._id, note: 'Payment confirmed' })
    await lead.save()
  }
  res.json(payment)
})

router.post('/policy', allowRoles('admin', 'employee'), async (req, res) => {
  const { leadId, insuranceType, premium, paymentId, policyExpiryDate } = req.body
  if (!leadId || !insuranceType || !premium || !paymentId) {
    return res.status(400).json({ message: 'Invalid policy data' })
  }
  const lead = await Lead.findById(leadId)
  const payment = await Payment.findById(paymentId)
  if (!lead || !payment) return res.status(404).json({ message: 'Lead or payment not found' })
  const policy = new Policy({
    lead: leadId,
    insuranceType,
    premium,
    payment: paymentId,
    policyNumber: `FIC-${Date.now()}`,
    status: 'issued',
    issuedAt: new Date(),
  })
  await policy.save()
  lead.status = 'issued'
  lead.insuranceType = insuranceType
  lead.policyExpiryDate = policyExpiryDate
  lead.history.push({ status: 'issued', author: req.user._id, note: 'Policy issued' })
  await lead.save()
  const slab = await IncentiveSetting.findOne({ insuranceType, active: true })
  let incentiveAmount = 0
  
  if (slab) {
    // Calculate based on type
    if (slab.type === 'percentage') {
      incentiveAmount = (premium * slab.value) / 100
    } else {
      incentiveAmount = slab.value
    }

    const incentive = new Incentive({
      user: lead.assignedTo || req.user._id,
      lead: leadId,
      insuranceType,
      amount: incentiveAmount,
      status: 'awarded',
      awardedAt: new Date(),
    })
    await incentive.save()

    // Sync to User Wallet
    if (lead.assignedTo) {
      await User.findByIdAndUpdate(lead.assignedTo, {
        $inc: { 'incentivesWallet.awarded': incentiveAmount }
      });
    }
  }
  res.status(201).json({ policy, incentiveAmount })
})

router.get('/incentives', async (req, res) => {
  const query = req.user.role === 'admin' ? {} : { user: req.user._id }
  const incentives = await Incentive.find(query).populate('lead', 'name phone status')
  res.json(incentives)
})

router.post('/incentive-settings', allowRoles('admin'), async (req, res) => {
  const { insuranceType, value, type } = req.body
  if (!insuranceType || value === undefined || !type) {
    return res.status(400).json({ message: 'Insurance type, value, and calculation type required' })
  }
  const setting = await IncentiveSetting.findOneAndUpdate(
    { insuranceType }, 
    { value, type, active: true }, 
    { upsert: true, new: true }
  )
  res.json(setting)
})

router.get('/incentive-settings', allowRoles('admin'), async (req, res) => {
  const settings = await IncentiveSetting.find()
  res.json(settings)
})

router.get('/policies', allowRoles('admin', 'team_leader'), async (req, res) => {
  const policies = await Policy.find().populate('lead', 'name email phone').populate('payment', 'amount status')
  res.json(policies)
})

export default router
