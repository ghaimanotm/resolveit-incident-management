// CONTROLLER: Incident CRUD
// Normal users see and manage only the incidents they reported.
// Admins see every incident and can assign, update or delete any of them.
import Incident from '../models/incident.model.js'
import errorHandler from '../helpers/dbErrorHandler.js'

const isAdmin = (req) => req.auth && req.auth.role === 'admin'
const isReporter = (req) =>
  req.incident && String(req.incident.reportedBy._id || req.incident.reportedBy) === String(req.auth._id)

// CREATE - POST /api/incidents
const create = async (req, res) => {
  try {
    const { title, description, category, priority, location } = req.body
    const incident = new Incident({
      title,
      description,
      category,
      priority,
      location,
      reportedBy: req.auth._id // always the signed-in user
    })
    await incident.save()
    return res.status(201).json(incident)
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// READ ALL - GET /api/incidents?status=Open&priority=High
const list = async (req, res) => {
  try {
    // Only plain text filter values are accepted (no objects/operators)
    const filter = {}
    for (const field of ['status', 'priority', 'category']) {
      if (typeof req.query[field] === 'string' && req.query[field]) filter[field] = req.query[field]
    }
    if (!isAdmin(req)) filter.reportedBy = req.auth._id

    const incidents = await Incident.find(filter)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ created: -1 })
    return res.json(incidents)
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// Loads the incident for any route with :incidentId into req.incident
const incidentByID = async (req, res, next, id) => {
  try {
    const incident = await Incident.findById(id)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
    if (!incident) return res.status(404).json({ error: 'Incident not found' })
    req.incident = incident
    next()
  } catch (err) {
    return res.status(400).json({ error: 'Could not retrieve incident' })
  }
}

// Authorization: only the reporter or an admin may touch an incident
const canAccess = (req, res, next) => {
  if (!(isAdmin(req) || isReporter(req))) {
    return res.status(403).json({ error: 'Not authorized to access this incident' })
  }
  next()
}

// READ ONE - GET /api/incidents/:incidentId
const read = (req, res) => res.json(req.incident)

// UPDATE - PUT /api/incidents/:incidentId
const update = async (req, res) => {
  try {
    const incident = req.incident
    // fields any reporter can edit
    const userFields = ['title', 'description', 'category', 'priority', 'location']
    // fields only an admin can edit (workflow)
    const adminFields = ['status', 'assignedTo', 'resolutionNotes']

    userFields.forEach((f) => {
      if (req.body[f] !== undefined) incident[f] = req.body[f]
    })
    const triedAdminField = adminFields.some((f) => req.body[f] !== undefined)
    if (triedAdminField) {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Only an admin can change status, assignment or resolution notes' })
      }
      adminFields.forEach((f) => {
        if (req.body[f] !== undefined) incident[f] = req.body[f]
      })
    }
    incident.updated = Date.now()
    await incident.save()
    await incident.populate([
      { path: 'reportedBy', select: 'name email' },
      { path: 'assignedTo', select: 'name email' }
    ])
    return res.json(incident)
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// DELETE - DELETE /api/incidents/:incidentId
const remove = async (req, res) => {
  try {
    await req.incident.deleteOne()
    return res.json({ message: 'Incident deleted', incident: req.incident })
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

export default { create, list, incidentByID, canAccess, read, update, remove }
