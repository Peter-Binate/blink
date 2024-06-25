import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, afterFetch } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import Sport from '#models/sport'
import SessionMember from '#models/session_member'
import Notification from './notification.js'

export default class SportSession extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare startDate: DateTime

  @column()
  declare sportId: number

  @column()
  declare maxParticipants: number

  @column()
  declare onlyBlindOrVisuallyImpaired: boolean

  @column()
  declare difficultyLevel: string

  @column()
  declare description: string

  @column()
  declare location: string

  @column()
  declare latitude: number

  @column()
  declare longitude: number

  @column({ serializeAs: null })
  declare geoLocationPoint: any

  @column()
  declare isPrivate: boolean

  @column()
  declare status: string

  @column.dateTime({ autoCreate: true })
  declare created_At: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Sport)
  declare sport: BelongsTo<typeof Sport>

  @belongsTo(() => Notification, { foreignKey: 'target_id' })
  declare notification: BelongsTo<typeof Notification>

  @hasMany(() => SessionMember, { foreignKey: 'sessionId' })
  declare members: HasMany<typeof SessionMember>

  // Hook afterFetch pour charger les membres
  @afterFetch()
  static async afterFetchHook(sessions: SportSession[]) {
    for (let session of sessions) {
      await session.load('members')
    }
  }
}
