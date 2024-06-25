import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'

import User from '#models/user'
import Sport from '#models/sport'

export default class SportLovedByUser extends BaseModel {
  update() {
    throw new Error('Method not implemented.')
  }
  @column({ isPrimary: true })
  declare id: number

  @column({ isPrimary: true })
  declare userId: number

  @column({ isPrimary: true })
  declare sportId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Sport)
  declare sport: BelongsTo<typeof Sport>

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
  //total: number | undefined
}
