import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import Sport from '#models/sport'

test.group('Sport List', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('it should fetch all sports', async ({ assert, client }) => {
    // eslint-disable-next-line unicorn/no-await-expression-member
    const sports = (await Sport.all()).map((sport) => sport.toJSON())
    const user = await User.find(1) // assuming a user with id 1 exists for authentication
    const response = await client.get('/api/sports/all').loginAs(user)
    response.assertStatus(200)
    console.log('Expected:', sports)
    console.log('Received:', response.body())
    assert.deepEqual(response.body(), sports)
  })
})
