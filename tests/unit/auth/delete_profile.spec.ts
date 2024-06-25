import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'

test.group('Edit Account', (group) => {
  let user: User

  group.each.setup(async () => {
    await db.beginGlobalTransaction()

    // Create the user for the test
    user = await User.create({
      email: 'iuonewproject54u6@test.com',
      password: 'password',
      firstname: 'John',
      lastname: 'Doe',
      birthdate: new Date('2000-10-22'),
      latitude: 41.25,
      longitude: 48.69,
    })
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('it should delete user', async ({ assert, client }) => {
    // Perform delete user action
    const response = await client.delete('/api/auth/delete').loginAs(user)
    response.assertStatus(200)

    // Verify user is deleted
    const userDeleted = await User.find(user.id)
    assert.isNull(userDeleted)
  })
})
