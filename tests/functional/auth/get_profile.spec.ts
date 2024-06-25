import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'

test.group('User Profile', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('it should get user Data', async ({ assert, client }) => {
    const user = await User.find(1)
    const response = user && (await client.get('/api/auth/profile').loginAs(user))
    response && response.assertStatus(200)
    response && assert.exists(response.body())
  })
})
