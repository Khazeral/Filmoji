import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class MoviesFounds extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare movieId: number
}
