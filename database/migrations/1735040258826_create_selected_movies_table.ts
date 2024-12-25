import { BaseSchema } from '@adonisjs/lucid/schema'

export default class SelectedMovies extends BaseSchema {
  protected tableName = 'selected_movies'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable()
      table.integer('movie_id').unsigned().notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.unique(['user_id'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
