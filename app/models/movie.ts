import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import MoviesFound from './movies_found.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Movie extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare emojis: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => MoviesFound)
  declare moviesFound: HasMany<typeof MoviesFound>
}
