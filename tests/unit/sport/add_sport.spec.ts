import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import Sport from '#models/sport'
import { DateTime } from 'luxon'

test.group('User Loved Sports Store', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('it should add loved sports successfully', async ({ assert, client }) => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password',
      latitude: 0,
      longitude: 0,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    })
    const sport1 = await Sport.create({ sportName: 'Basketball' })
    const sport2 = await Sport.create({ sportName: 'Football' })

    const response = await client
      .post('/api/user/lovedsports/store')
      .loginAs(user)
      .send({ sport_ids: [sport1.id, sport2.id] })

    response.assertStatus(200)
    assert.equal(response.body().message, 'Sports ajoutés avec succès.')
  })
})
