import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Friendship from './friendship.js'
import SportSession from './sport_session.js'

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare targetId: number

  @column()
  declare targetType: string

  @column()
  declare title: string

  @column()
  declare content: string

  @column()
  declare readDate: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Friendship, { foreignKey: 'target_id' })
  declare friendship: BelongsTo<typeof Friendship>

  @belongsTo(() => SportSession, { foreignKey: 'target_id' })
  declare sportSession: BelongsTo<typeof SportSession>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
