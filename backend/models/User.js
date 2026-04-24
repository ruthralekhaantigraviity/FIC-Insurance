import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['admin', 'employee', 'team_leader'], default: 'employee' },
  team: { type: String, default: 'Default' },
  teamLeader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  branch: { type: String },
  incentivesWallet: {
    pending: { type: Number, default: 0 },
    awarded: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
})

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

export default mongoose.model('User', userSchema)
