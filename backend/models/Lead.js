import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

const historySchema = new mongoose.Schema({
  status: { type: String, required: true },
  note: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
})

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  source: { type: String, default: 'Web' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: [
      'New Lead',
      'Follow-up',
      'Interested',
      'Document Collected',
      'Policy Submitted',
      'Converted',
      'Rejected',
    ],
    default: 'New Lead',
  },
  premiumAmount: { type: Number, default: 0 },
  insuranceType: { type: String, enum: ['od', 'third_party', 'motor', 'health', 'life', 'property', 'none'], default: 'none' },
  followUpDate: { type: Date },
  policyExpiryDate: { type: Date },
  notes: [noteSchema],
  history: [historySchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Lead', leadSchema)
