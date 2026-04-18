import express from 'express';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import Announcement from '../models/Announcement.js';
import Task from '../models/Task.js';
import Incentive from '../models/Incentive.js';
import Payment from '../models/Payment.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Lead.deleteMany({});
    await Announcement.deleteMany({});
    await Task.deleteMany({});
    await Incentive.deleteMany({});
    await Payment.deleteMany({});

    // Create Admin
    const admin = new User({
      name: 'FIC Administrator',
      email: 'admin@fic.com',
      password: 'admin123',
      role: 'admin',
      branch: 'Head Office',
    });
    await admin.save();

    // Create Employees
    const agents = [];
    const agentData = [
      { name: 'Rahul Sharma', email: 'rahul@fic.com', team: 'Motor Sales', branch: 'Thirupathur' },
      { name: 'Priya Patel', email: 'priya@fic.com', team: 'Life Insurance', branch: 'Krishanagiri' },
      { name: 'Amit Verma', email: 'amit@fic.com', team: 'Motor Sales', branch: 'Chennai' },
      { name: 'Sneha Reddy', email: 'sneha@fic.com', team: 'Health', branch: 'Bangalore' }
    ];

    for (const data of agentData) {
      const agent = new User({
        ...data,
        password: 'password123',
        role: 'employee',
      });
      await agent.save();
      agents.push(agent);
    }

    // Create Team Leader
    const teamLeader = new User({
      name: 'Vikram TL',
      email: 'tl@fic.com',
      password: 'password123',
      role: 'team_leader',
      branch: 'Mumbai',
    });
    await teamLeader.save();

    // Create Sample Leads
    const sampleLeads = [
      { name: 'Deepak Kumar', phone: '9876543210', status: 'issued', assignedTo: agents[0]._id, insuranceType: 'od' },
      { name: 'Suresh Raina', phone: '9123456789', status: 'interested', assignedTo: agents[1]._id, insuranceType: 'third_party' },
      { name: 'Anita Desai', phone: '9988776655', status: 'new', insuranceType: 'od' },
      { name: 'Vikram Singh', phone: '9555444333', status: 'follow_up', assignedTo: agents[2]._id, insuranceType: 'third_party' },
      { name: 'Meera Kapoor', phone: '9444333222', status: 'payment_link_sent', assignedTo: agents[0]._id, insuranceType: 'od' },
      { name: 'Raj Kumar', phone: '9333222111', status: 'called', assignedTo: agents[2]._id, insuranceType: 'od' },
      { name: 'Sonia Gandhi', phone: '9222111000', status: 'issued', assignedTo: agents[3]._id, insuranceType: 'third_party' }
    ];
    await Lead.insertMany(sampleLeads);

    // Create Sample Payments
    const completedLeads = await Lead.find({ status: 'issued' });
    for (const lead of completedLeads) {
      const payment = await Payment.create({
        lead: lead._id,
        amount: lead.insuranceType === 'od' ? 15000 : 5000,
        status: 'completed',
        transactionId: `TXN${Math.floor(Math.random() * 1000000)}`,
        sentBy: lead.assignedTo
      });

      // Create Incentives for completed payments
      const incentiveAmount = lead.insuranceType === 'od' ? (payment.amount * 0.1) : 500;
      await Incentive.create({
        user: lead.assignedTo,
        lead: lead._id,
        insuranceType: lead.insuranceType,
        amount: incentiveAmount,
        status: 'awarded',
        awardedAt: new Date()
      });
    }

    // Create Announcements
    await Announcement.create({
      title: 'Target Achievement Bonus!',
      message: 'All agents completing 50+ conversions this month will receive an extra 5% incentive bonus. Keep up the great work!',
      visibleTo: ['employee']
    });

    await Announcement.create({
      title: 'System Update',
      message: 'The CRM portal has been updated with new leaderboard features and real-time incentive tracking.',
      visibleTo: ['admin', 'employee', 'team_leader']
    });

    // Create Tasks
    const followUpLeads = await Lead.find({ status: 'follow_up' });
    for (const lead of followUpLeads) {
      await Task.create({
        title: `Follow up with ${lead.name}`,
        description: 'Discuss the premium benefits and closing the policy.',
        assignedTo: lead.assignedTo,
        dueDate: new Date(Date.now() + 86400000), // Tomorrow
        status: 'pending',
        priority: 'high'
      });
    }

    res.json({ message: 'Database seeded successfully. Login: admin@fic.com / admin123' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Seeding failed' });
  }
});

export default router;
