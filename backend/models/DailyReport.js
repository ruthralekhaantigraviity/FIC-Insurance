import mongoose from 'mongoose';

const dailyReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  summary: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String
  },
  statsSnapshot: {
    totalCalls: { type: Number, default: 0 },
    interested: { type: Number, default: 0 },
    notInterested: { type: Number, default: 0 },
    paid: { type: Number, default: 0 },
    nonPaid: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    notPicking: { type: Number, default: 0 },
    issued: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.model('DailyReport', dailyReportSchema);
