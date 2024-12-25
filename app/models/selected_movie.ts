import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Movie from './movie.js'
import User from './user.js'

export default class SelectedMovie extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare movieId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Movie)
  declare movie: BelongsTo<typeof Movie>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
