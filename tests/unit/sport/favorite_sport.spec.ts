import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import Sport from '#models/sport'
import SportLovedByUser from '#models/sport_loved_by_user'
import { DateTime } from 'luxon'

test.group('User Loved Sports', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('it should fetch loved sports for authenticated user', async ({ assert, client }) => {
    // Setup user and sports data
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

    await SportLovedByUser.create({ userId: user.id, sportId: sport1.id })
    await SportLovedByUser.create({ userId: user.id, sportId: sport2.id })

    // Authenticate and make the request
    const response = await client.get('/api/user/lovedsports/get').loginAs(user)

    // Assertions
    response.assertStatus(200)
    const lovedSports = response.body()

    assert.lengthOf(lovedSports, 2)
    assert.equal(lovedSports[0].sport.id, sport1.id)
    assert.equal(lovedSports[0].sport.sportName, 'Basketball')
    assert.equal(lovedSports[1].sport.id, sport2.id)
    assert.equal(lovedSports[1].sport.sportName, 'Football')
  })
})
