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
    calls: Number,
    interested: Number,
    issued: Number
  }
}, { timestamps: true });

export default mongoose.model('DailyReport', dailyReportSchema);
