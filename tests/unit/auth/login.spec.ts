import { test } from '@japa/runner'

test.group('Auth login', () => {
  test('it should login a user successfully', async ({ assert, client }) => {
    const requestData = {
      email: 'virk@adonisjs.com',
      password: '12345678',
    }
    const response = await client.post('/api/auth/login').json(requestData)
    response.assertStatus(200)
    assert.exists(response.body().token)
  })
})
