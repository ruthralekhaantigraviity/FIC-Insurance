import mongoose from 'mongoose';

const callSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['interested', 'not_interested', 'unreachable'], required: true },
  isPaid: { type: Boolean, default: false },
  notes: { type: String },
  duration: { type: Number }, // in seconds
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Call', callSchema);
