// Turns Mongoose/MongoDB errors into one readable message for the client.

const getUniqueErrorMessage = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'Field'
  return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
}

const getErrorMessage = (err) => {
  if (err.code === 11000 || err.code === 11001) {
    return getUniqueErrorMessage(err)
  }
  if (err.errors) {
    // Validation error: return the first field's message
    const first = Object.values(err.errors)[0]
    if (first && first.message) return first.message
  }
  if (err.name === 'CastError') return `Invalid ${err.path}`
  return err.message || 'Something went wrong'
}

export default { getErrorMessage }
