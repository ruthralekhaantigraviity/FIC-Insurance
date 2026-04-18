import mongoose from 'mongoose'

const incentiveSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  insuranceType: { type: String, enum: ['od', 'third_party'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'awarded'], default: 'pending' },
  awardedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Incentive', incentiveSchema)
