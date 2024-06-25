// import { test } from '@japa/runner'
// import db from '@adonisjs/lucid/services/db'
// import User from '#models/user'

// test.group('Edit Account', (group) => {
//   let user: User
//   // setup
//   group.each.setup(async () => {
//     await db.beginGlobalTransaction()
//     const userData = {
//       id: 1000,
//       email: 'jhondhoe@gmail.com',
//       password: 'q1s25dd1d',
//       firstname: 'Jhon',
//       lastname: 'Dodo',
//       birthdate: new Date('2000-10-22'),
//     }
//     user = await User.create(userData)
//   })

//   group.each.teardown(async () => {
//     await db.rollbackGlobalTransaction()
//   })

//   test('it should update user Data', async ({ assert, client }) => {
//     const updateData = {
//       lastname: 'John',
//       firstname: 'Doe',
//     }

//     // Envoyer la requête pour mettre à jour les données de l'utilisateur
//     const response = await client.put('/api/auth/edit').loginAs(user).json(updateData)

//     // Vérifier le statut de la réponse
//     response.assertStatus(200)

//     // Vérifier le contenu de la réponse
//     response && response.assertStatus(200)
//     const reponseBody = response && response.body()
//     assert.exists(reponseBody)
//     assert.equal(reponseBody.data.firstname, updateData.firstname)
//     assert.equal(reponseBody.data.lastname, updateData.lastname)

//     // Rafraîchir les données de l'utilisateur depuis la base de données et vérifier les mises à jour
//     await user.refresh()
//     assert.equal(user.firstname, updateData.firstname)
//     assert.equal(user.lastname, updateData.lastname)
//   })
// })
