// import { test } from '@japa/runner'
// import db from '@adonisjs/lucid/services/db'
// import User from '#models/user'
// import SportLovedByUser from '#models/sport_loved_by_user'

// test.group('Store Sports', (group) => {
//   group.each.setup(async () => {
//     await db.beginGlobalTransaction()
//     return () => db.rollbackGlobalTransaction()
//   })

//   test('it should add new sports successfully', async ({ assert, client }) => {
//     const user = await User.create({
//       email: 'virk@adonisjs.com',
//       password: 'password',
//     })

//     const requestData = {
//       sport_ids: [1, 2, 3, 4, 5],
//     }

//     const response = await client.post('/api/sports').loginAs(user).json(requestData)

//     response.assertStatus(200)
//     assert.exists(response.body().message)
//     assert.equal(response.body().message, 'Sports ajoutés avec succès.')
//   })

//   test('it should return error if more than 5 sports submitted', async ({ assert, client }) => {
//     const user = await User.create({
//       email: 'test@example.com',
//       password: 'password',
//     })

//     const requestData = {
//       sport_ids: [1, 2, 3, 4, 5, 6],
//     }

//     const response = await client.post('/api/sports').loginAs(user).json(requestData)

//     response.assertStatus(400)
//     assert.exists(response.body().message)
//     assert.equal(response.body().message, "Vous pouvez soumettre jusqu'à 5 sports à la fois.")
//   })

//   test('it should return error if user already has 5 sports', async ({ assert, client }) => {
//     const user = await User.create({
//       email: 'test@example.com',
//       password: 'password',
//     })

//     await SportLovedByUser.createMany([
//       { userId: user.id, sportId: 1 },
//       { userId: user.id, sportId: 2 },
//       { userId: user.id, sportId: 3 },
//       { userId: user.id, sportId: 4 },
//       { userId: user.id, sportId: 5 },
//     ])

//     const requestData = {
//       sport_ids: [6, 7],
//     }

//     const response = await client.post('/api/sports').loginAs(user).json(requestData)

//     response.assertStatus(400)
//     assert.exists(response.body().message)
//     assert.equal(response.body().message, 'Vous ne pouvez pas avoir plus de 5 sports préférés.')
//   })

//   test('it should return error if new sports exceed limit', async ({ assert, client }) => {
//     const user = await User.create({
//       email: 'test@example.com',
//       password: 'password',
//     })

//     await SportLovedByUser.createMany([
//       { userId: user.id, sportId: 1 },
//       { userId: user.id, sportId: 2 },
//     ])

//     const requestData = {
//       sport_ids: [3, 4, 5, 6],
//     }

//     const response = await client.post('/api/sports').loginAs(user).json(requestData)

//     response.assertStatus(400)
//     assert.exists(response.body().message)
//     assert.equal(response.body().message, 'Vous ne pouvez ajouter que 3 sports supplémentaires.')
//   })

//   test('it should return error if all sports already loved', async ({ assert, client }) => {
//     const user = await User.create({
//       email: 'test@example.com',
//       password: 'password',
//     })

//     await SportLovedByUser.createMany([
//       { userId: user.id, sportId: 1 },
//       { userId: user.id, sportId: 2 },
//       { userId: user.id, sportId: 3 },
//       { userId: user.id, sportId: 4 },
//       { userId: user.id, sportId: 5 },
//     ])

//     const requestData = {
//       sport_ids: [1, 2, 3, 4, 5],
//     }

//     const response = await client.post('/api/sports').loginAs(user).json(requestData)

//     response.assertStatus(400)
//     assert.exists(response.body().message)
//     assert.equal(response.body().message, 'Tous les sports soumis sont déjà aimés.')
//   })
// })
