import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

test.group('Check Email', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('it should return true if email exists', async ({ assert, client }) => {
    const existingEmail = 'newproject54u6@test.com'
    // Créer un utilisateur avec l'email existant

    const response = await client.post('/api/auth/check-email').json({ email: existingEmail })
    console.log(response)

    response.assertStatus(200)
    assert.exists(response.body().exists)
    assert.isTrue(response.body().exists)
  })

  test('it should return false if email does not exist', async ({ assert, client }) => {
    const nonExistingEmail = 'nonexisting@test.com'
    const response = await client.post('/api/auth/check-email').json({ email: nonExistingEmail })
    response.assertStatus(200)
    assert.exists(response.body().exists)
    assert.isFalse(response.body().exists)
  })

  test('it should return an error if email is not provided', async ({ assert, client }) => {
    const response = await client.post('/api/auth/check-email').json({})
    response.assertStatus(400)
    assert.exists(response.body().error)
    assert.equal(response.body().error, 'Votre email est obligatoire')
  })
})
