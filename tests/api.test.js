// Automated API tests (Node's built-in test runner + Supertest).
// Uses a separate test database that is wiped before and after the run.
//   npm test
import { test, before, after, describe } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import mongoose from 'mongoose'
import app from '../server/express.js'
import User from '../server/models/user.model.js'

const TEST_DB = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/resolveit_test'

const alice = { name: 'Alice Reporter', email: 'alice@test.com', password: 'alice123' }
const bob = { name: 'Bob Reporter', email: 'bob@test.com', password: 'bob12345' }
const admin = { name: 'Admin User', email: 'admin@test.com', password: 'admin123' }
const state = {}

before(async () => {
  await mongoose.connect(TEST_DB)
  await mongoose.connection.dropDatabase()
  await User.init() // build the unique index on email
  const a = new User({ ...admin, role: 'admin' })
  await a.save()
})

after(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
})

describe('User sign up (CREATE)', () => {
  test('POST /api/users creates a user without returning the password hash', async () => {
    const res = await request(app).post('/api/users').send(alice)
    assert.equal(res.status, 201)
    assert.equal(res.body.user.email, alice.email)
    assert.equal(res.body.user.role, 'user')
    assert.equal(res.body.user.hashed_password, undefined)
    state.aliceId = res.body.user._id
    await request(app).post('/api/users').send(bob).expect(201)
  })

  test('rejects a duplicate email', async () => {
    const res = await request(app).post('/api/users').send(alice)
    assert.equal(res.status, 400)
    assert.match(res.body.error, /already exists/i)
  })

  test('rejects a short password', async () => {
    const res = await request(app).post('/api/users').send({ name: 'X', email: 'x@test.com', password: '123' })
    assert.equal(res.status, 400)
    assert.match(res.body.error, /at least 6/i)
  })

  test('ignores a role sent at sign up (no self-promotion to admin)', async () => {
    const res = await request(app).post('/api/users')
      .send({ name: 'Sneaky', email: 'sneaky@test.com', password: 'sneaky123', role: 'admin' })
    assert.equal(res.status, 201)
    assert.equal(res.body.user.role, 'user')
  })
})

describe('Authentication', () => {
  test('POST /auth/signin returns a JWT for valid credentials', async () => {
    const res = await request(app).post('/auth/signin').send({ email: alice.email, password: alice.password })
    assert.equal(res.status, 200)
    assert.ok(res.body.token)
    state.aliceToken = res.body.token
    state.bobToken = (await request(app).post('/auth/signin').send({ email: bob.email, password: bob.password })).body.token
    const adminRes = await request(app).post('/auth/signin').send({ email: admin.email, password: admin.password })
    state.adminToken = adminRes.body.token
    assert.equal(adminRes.body.user.role, 'admin')
  })

  test('rejects a wrong password', async () => {
    const res = await request(app).post('/auth/signin').send({ email: alice.email, password: 'wrong' })
    assert.equal(res.status, 401)
  })

  test('protected route without a token returns 401', async () => {
    const res = await request(app).get('/api/incidents')
    assert.equal(res.status, 401)
  })

  test('GET /auth/signout clears the cookie', async () => {
    const res = await request(app).get('/auth/signout')
    assert.equal(res.status, 200)
    assert.match(res.headers['set-cookie'][0], /^t=;/)
  })
})

describe('User CRUD and authorization', () => {
  test('GET /api/users is admin only', async () => {
    await request(app).get('/api/users').set('Authorization', `Bearer ${state.aliceToken}`).expect(403)
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${state.adminToken}`)
    assert.equal(res.status, 200)
    assert.ok(res.body.length >= 3)
  })

  test('GET /api/users/:userId reads a profile', async () => {
    const res = await request(app).get(`/api/users/${state.aliceId}`).set('Authorization', `Bearer ${state.aliceToken}`)
    assert.equal(res.status, 200)
    assert.equal(res.body.name, alice.name)
  })

  test('PUT /api/users/:userId lets a user update their own profile', async () => {
    const res = await request(app).put(`/api/users/${state.aliceId}`)
      .set('Authorization', `Bearer ${state.aliceToken}`).send({ name: 'Alice Updated' })
    assert.equal(res.status, 200)
    assert.equal(res.body.name, 'Alice Updated')
  })

  test("a user cannot update someone else's profile (403)", async () => {
    await request(app).put(`/api/users/${state.aliceId}`)
      .set('Authorization', `Bearer ${state.bobToken}`).send({ name: 'Hacked' }).expect(403)
  })

  test('a user cannot make themselves admin', async () => {
    await request(app).put(`/api/users/${state.aliceId}`)
      .set('Authorization', `Bearer ${state.aliceToken}`).send({ role: 'admin' }).expect(403)
  })
})

describe('Incident CRUD and authorization', () => {
  test('POST /api/incidents creates an incident for the signed-in user', async () => {
    const res = await request(app).post('/api/incidents').set('Authorization', `Bearer ${state.aliceToken}`)
      .send({ title: 'Printer offline', description: '3rd floor printer is not responding', category: 'IT', priority: 'High', location: 'Building A, floor 3' })
    assert.equal(res.status, 201)
    assert.equal(res.body.status, 'Open')
    assert.equal(String(res.body.reportedBy), state.aliceId)
    state.incidentId = res.body._id
  })

  test('rejects an incident without a title', async () => {
    const res = await request(app).post('/api/incidents').set('Authorization', `Bearer ${state.aliceToken}`)
      .send({ description: 'No title' })
    assert.equal(res.status, 400)
    assert.match(res.body.error, /title is required/i)
  })

  test('GET /api/incidents shows users only their own incidents, admins all', async () => {
    await request(app).post('/api/incidents').set('Authorization', `Bearer ${state.bobToken}`)
      .send({ title: 'Broken door lock', description: 'Main entrance lock is jammed', category: 'Facilities' }).expect(201)
    const aliceList = await request(app).get('/api/incidents').set('Authorization', `Bearer ${state.aliceToken}`)
    assert.equal(aliceList.body.length, 1)
    const adminList = await request(app).get('/api/incidents').set('Authorization', `Bearer ${state.adminToken}`)
    assert.equal(adminList.body.length, 2)
  })

  test('GET /api/incidents?priority=High filters results', async () => {
    const res = await request(app).get('/api/incidents?priority=High').set('Authorization', `Bearer ${state.adminToken}`)
    assert.equal(res.body.length, 1)
    assert.equal(res.body[0].title, 'Printer offline')
  })

  test('GET /api/incidents/:incidentId reads one incident', async () => {
    const res = await request(app).get(`/api/incidents/${state.incidentId}`).set('Authorization', `Bearer ${state.aliceToken}`)
    assert.equal(res.status, 200)
    assert.equal(res.body.reportedBy.name, 'Alice Updated')
  })

  test("another user cannot read Alice's incident (403)", async () => {
    await request(app).get(`/api/incidents/${state.incidentId}`).set('Authorization', `Bearer ${state.bobToken}`).expect(403)
  })

  test('PUT /api/incidents/:incidentId lets the reporter edit details', async () => {
    const res = await request(app).put(`/api/incidents/${state.incidentId}`)
      .set('Authorization', `Bearer ${state.aliceToken}`).send({ priority: 'Critical' })
    assert.equal(res.status, 200)
    assert.equal(res.body.priority, 'Critical')
  })

  test('only an admin can change the status', async () => {
    await request(app).put(`/api/incidents/${state.incidentId}`)
      .set('Authorization', `Bearer ${state.aliceToken}`).send({ status: 'Resolved' }).expect(403)
    const res = await request(app).put(`/api/incidents/${state.incidentId}`)
      .set('Authorization', `Bearer ${state.adminToken}`)
      .send({ status: 'Resolved', resolutionNotes: 'Restarted print spooler' })
    assert.equal(res.status, 200)
    assert.equal(res.body.status, 'Resolved')
  })

  test('returns 404 for an incident that does not exist', async () => {
    await request(app).get(`/api/incidents/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${state.adminToken}`).expect(404)
  })

  test('DELETE /api/incidents/:incidentId deletes the incident', async () => {
    await request(app).delete(`/api/incidents/${state.incidentId}`).set('Authorization', `Bearer ${state.aliceToken}`).expect(200)
    await request(app).get(`/api/incidents/${state.incidentId}`).set('Authorization', `Bearer ${state.aliceToken}`).expect(404)
  })

  test('passwords are stored only as a salted scrypt hash', async () => {
    const stored = await User.findOne({ email: bob.email }).lean()
    assert.notEqual(stored.hashed_password, bob.password)
    assert.equal(stored.hashed_password.length, 128) // 64-byte scrypt hash in hex
    assert.equal(stored.salt.length, 32) // 16-byte random salt
  })

  test('DELETE /api/users/:userId lets a user delete their own account', async () => {
    await request(app).delete(`/api/users/${state.aliceId}`).set('Authorization', `Bearer ${state.aliceToken}`).expect(200)
    await request(app).get(`/api/users/${state.aliceId}`).set('Authorization', `Bearer ${state.adminToken}`).expect(404)
  })
})

describe('Security best practices', () => {
  test('NoSQL injection in sign-in is blocked', async () => {
    const res = await request(app).post('/auth/signin')
      .send({ email: { $ne: null }, password: { $ne: null } })
    assert.equal(res.status, 400)
    assert.equal(res.body.token, undefined)
  })

  test('operator keys are stripped from query filters', async () => {
    const res = await request(app).get('/api/incidents?status[$ne]=Open')
      .set('Authorization', `Bearer ${state.adminToken}`)
    assert.equal(res.status, 200)
  })

  test('secure HTTP headers are set (Helmet)', async () => {
    const res = await request(app).get('/')
    assert.equal(res.headers['x-content-type-options'], 'nosniff')
    assert.equal(res.headers['x-powered-by'], undefined)
  })

  test('repeated sign-in attempts are rate limited (429)', async () => {
    let last
    for (let i = 0; i < 12; i++) {
      last = await request(app).post('/auth/signin').send({ email: bob.email, password: 'wrong-password' })
    }
    assert.equal(last.status, 429)
  })
})
