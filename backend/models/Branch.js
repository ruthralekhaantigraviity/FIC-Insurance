import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Branch', branchSchema);
