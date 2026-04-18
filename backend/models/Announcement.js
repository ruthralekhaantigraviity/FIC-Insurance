import mongoose from 'mongoose'

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  visibleTo: { type: [String], default: ['admin', 'employee', 'team_leader'] },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Announcement', announcementSchema)
