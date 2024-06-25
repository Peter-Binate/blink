import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'

test.group('Edit Account', (group) => {
  let user: User
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    const userData = {
      id: 1000,
      email: 'newpro@test.com',
      password: 'q1s25dd1d',
      firstname: 'Jhon',
      lastname: 'Dodo',
      birthdate: new Date('2000-10-22'),
      latitude: 41.25, // Ensure latitude is provided
      longitude: 48.69, // Ensure longitude is provided
    }
    user = await User.create(userData)
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('it should update user Data', async ({ assert, client }) => {
    const updateData = {
      lastname: 'John',
      firstname: 'Doe',
    }

    const response = await client.put('/api/auth/edit').loginAs(user).json(updateData)

    response.assertStatus(200)
    const responseBody = response.body()
    assert.exists(responseBody)
    assert.equal(responseBody.data.firstname, updateData.firstname)
    assert.equal(responseBody.data.lastname, updateData.lastname)

    await user.refresh()
    assert.equal(user.firstname, updateData.firstname)
    assert.equal(user.lastname, updateData.lastname)
  })
})
