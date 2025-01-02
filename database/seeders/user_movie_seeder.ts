import Movie from '#models/movie'
import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class UserMovieSeeder extends BaseSeeder {
  public async run() {
    const users = await User.all()
    const movies = await Movie.all()

    if (users.length === 0 || movies.length === 0) {
      console.error('Pas assez d’utilisateurs ou de films pour créer des associations.')
      return
    }

    for (const user of users) {
      const associations: Record<number, { been_found: boolean; is_target: boolean }> =
        movies.reduce(
          (acc, movie) => {
            acc[movie.id] = {
              been_found: false,
              is_target: false,
            }
            return acc
          },
          {} as Record<number, { been_found: boolean; is_target: boolean }>
        )

      await user.related('userMovies').attach(associations)
    }
  }
}
