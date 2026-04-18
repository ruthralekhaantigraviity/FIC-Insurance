import mongoose from 'mongoose'

const policySchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  insuranceType: { type: String, enum: ['od', 'third_party'], required: true },
  premium: { type: Number, required: true },
  policyNumber: { type: String, required: true, unique: true },
  status: { type: String, enum: ['processing', 'issued', 'rejected'], default: 'processing' },
  issuedAt: { type: Date },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Policy', policySchema)
