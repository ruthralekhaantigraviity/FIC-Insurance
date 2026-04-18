import mongoose from 'mongoose'

const incentiveSettingSchema = new mongoose.Schema({
  insuranceType: { type: String, enum: ['od', 'third_party', 'none'], required: true, unique: true },
  value: { type: Number, required: true },
  type: { type: String, enum: ['percentage', 'flat'], default: 'flat' },
  active: { type: Boolean, default: true },
})

export default mongoose.model('IncentiveSetting', incentiveSettingSchema)
