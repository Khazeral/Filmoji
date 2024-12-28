import { BaseSchema } from '@adonisjs/lucid/schema'

export default class UserMovies extends BaseSchema {
  protected tableName = 'user_movies'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('movie_id').unsigned().references('movies.id').onDelete('CASCADE')
      table.boolean('been_found').defaultTo(false)
      table.boolean('is_target').defaultTo(false)
      table.primary(['user_id', 'movie_id'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
