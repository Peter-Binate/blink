import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

test.group('Auth Register', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('it should register a user successfully', async ({ assert, client }) => {
    const requestData = {
      email: 'testrer@test.com',
      password: 'password',
      firstname: 'Jhon',
      lastname: 'Doe',
      birthdate: '1999-12-12',
      location: '13 rue jean moulin',
      status: 'aveugle',
      latitude: 41.25,
      longitude: 48.69,
    }

    console.log(requestData)

    const response = await client.post('/api/auth/register').json(requestData)

    response.assertStatus(201)

    //assert.exists(response.body().token)
    assert.exists(response.body().streamToken)
  })
})
