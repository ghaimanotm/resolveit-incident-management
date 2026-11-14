// Middleware: blocks NoSQL injection.
// Removes any key that starts with "$" or contains "." from req.body,
// req.query and req.params, so a request like
//   { "email": { "$ne": null }, "password": "x" }
// cannot be turned into a MongoDB query operator.

const clean = (value) => {
  if (Array.isArray(value)) return value.map(clean)
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete value[key]
      } else {
        value[key] = clean(value[key])
      }
    }
  }
  return value
}

const sanitize = (req, res, next) => {
  if (req.body) clean(req.body)
  if (req.params) clean(req.params)
  if (req.query) {
    // req.query is a getter in Express 4; clean a copy and replace values in place
    const q = clean({ ...req.query })
    for (const key of Object.keys(req.query)) {
      if (!(key in q)) delete req.query[key]
      else req.query[key] = q[key]
    }
  }
  next()
}

export default sanitize
