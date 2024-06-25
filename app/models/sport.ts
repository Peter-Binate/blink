import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import SportLovedByUser from '#models/sport_loved_by_user'
import SportSession from './sport_session.js'

export default class Sport extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare sportName: string

  // un sport peut être aimé par plusieurs utilisateurs
  @hasMany(() => SportLovedByUser)
  declare lovedByUsers: HasMany<typeof SportLovedByUser>

  // sport de la session
  @hasMany(() => SportSession)
  declare sportSessions: HasMany<typeof SportSession>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
