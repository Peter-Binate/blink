import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
// import Notification from './notification.js'

export default class Friendship extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare senderUserId: number

  @column()
  declare receiverUserId: number

  @column()
  declare status: string

  @belongsTo(() => User, { foreignKey: 'senderUserId' })
  declare sender: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'receiverUserId' })
  declare receiver: BelongsTo<typeof User>

  // @belongsTo(() => Notification, { foreignKey: 'target_id' })
  // declare notification: BelongsTo<typeof Notification>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
