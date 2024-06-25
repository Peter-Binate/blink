import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import SportLovedByUser from '#models/sport_loved_by_user'
import Friendship from '#models/friendship'
import Notification from '#models/notification'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare lastname: string

  @column()
  declare firstname: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare phoneNumber: string | null

  @column()
  declare birthdate: Date

  @column()
  declare biography: string | null

  @column()
  declare location: string

  @column()
  declare latitude?: number

  @column()
  declare longitude?: number

  @column({ serializeAs: null })
  declare geoLocationPoint: any

  @column()
  declare status: string

  @column()
  declare profilImage: string

  //Indique qu'un utilisateur peut aimer plusieurs sports
  @hasMany(() => SportLovedByUser)
  declare lovedSports: HasMany<typeof SportLovedByUser>

  @hasMany(() => Friendship, { foreignKey: 'sender_user_id' })
  declare sender: HasMany<typeof Friendship>

  @hasMany(() => Friendship, { foreignKey: 'receiver_user_id' })
  declare receiver: HasMany<typeof Friendship>

  @hasMany(() => Notification)
  declare notification: HasMany<typeof Notification>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
