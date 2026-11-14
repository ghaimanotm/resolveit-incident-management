// MODEL: Incident
// The main object of the ResolveIT site: an incident record (IT issue,
// facility problem, safety concern...) reported by a signed-in user.
import mongoose from 'mongoose'

const IncidentSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: 'Title is required',
    maxlength: [120, 'Title must be 120 characters or fewer']
  },
  description: {
    type: String,
    trim: true,
    required: 'Description is required'
  },
  category: {
    type: String,
    enum: ['IT', 'Facilities', 'Security', 'Health & Safety', 'Other'],
    default: 'Other'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  location: { type: String, trim: true },
  reportedBy: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.ObjectId, ref: 'User' },
  resolutionNotes: { type: String, trim: true },
  created: { type: Date, default: Date.now },
  updated: Date
})

IncidentSchema.set('toJSON', {
  transform (doc, ret) {
    delete ret.__v
    return ret
  }
})

export default mongoose.model('Incident', IncidentSchema)
