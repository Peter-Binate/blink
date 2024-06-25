import SportSession from '#models/sport_session'
import User from '#models/user'
import { AuthorizationResponse, BasePolicy } from '@adonisjs/bouncer'

export default class SportSessionPolicy extends BasePolicy {
  static isAdmin: any
  async isAdmin(user: User, sportSessionId: number): Promise<boolean | AuthorizationResponse> {
    // Récupère la session en question avec les membres associés
    const sportSession = await SportSession.query()
      .where('id', sportSessionId)
      .preload('members', (membersQuery) => {
        membersQuery.where('userId', user.id).andWhere('isAdmin', true)
      })
      .firstOrFail()

    // Vérifie si un membre admin correspondant a été chargé
    return sportSession.members.length > 0
  }
}
// import SportSession from '#models/sport_session'
// import User from '#models/user'
// import { AuthorizationResponse, BasePolicy } from '@adonisjs/bouncer'

// export default class SportsessionAuthorPolicy extends BasePolicy {
//   async isAdmin(user: User, sportSession: SportSession): Promise<boolean | AuthorizationResponse> {
//     const adminSessionMember = await SportSession.query()
//       .where('id', sportSession.id)
//       .preload('session_members', (membersQuery) => {
//         membersQuery.where('userId', user.id).andWhere('isAdmin', true)
//       })
//       .firstOrFail()

//     const isAdmin = adminSessionMember.userId && adminSessionMember.userId.length > 0

//     // Retourner directement un booléen si cela est acceptable
//     return isAdmin
//   }
// }
