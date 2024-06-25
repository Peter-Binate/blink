import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import SportSession from '#models/sport_session'
import User from '#models/user'

export default class SessionMember extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare sessionId: number

  @column()
  declare isAdmin: boolean

  @column()
  declare isAccepted: boolean

  @belongsTo(() => SportSession, { foreignKey: 'sessionId' })
  declare session: BelongsTo<typeof SportSession>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
