import Movie from '#models/movie'
import { HttpContext } from '@adonisjs/core/http'
import { randomPick } from '../utils/random_pick.js'
import { getLevenshteinDistance } from '../utils/levenshtein_distance.js'
import UsersController from './users_controller.js'
import MoviesFound from '#models/movies_found'
import logger from '@adonisjs/core/services/logger'

export default class MovieController {
  public async initializeGame({ view, session }: HttpContext) {
    let user = session.get('user')

    if (!user) {
      user = { id: `anon_${Math.random().toString(36).substr(2, 9)}`, score: 0 }
      session.put('user', user)
    }

    const movies = await Movie.all()
    const randomMovieIndex = randomPick(movies.length)
    const movieSelected = movies[randomMovieIndex]
    session.put('movieSelected', movieSelected)

    return view.render('game', {
      movieSelected: movieSelected,
      score: user.score,
    })
  }

  public async checkAnswer({ request, response, session, view }: HttpContext) {
    const movieSelected = session.get('movieSelected')
    const usersController = new UsersController()
    const userAnswer = request.input('user_answer')

    const movie = await Movie.findBy('id', movieSelected.id)
    if (!movie) {
      return response.status(404).send({ error: 'Film non trouvé' })
    }

    const distance = getLevenshteinDistance(userAnswer.toLowerCase(), movie.name.toLowerCase())
    const isCorrect = distance <= 3
    let user = session.get('user')

    if (isCorrect) {
      usersController.incrementUserScore(user.id)

      logger.info(user.id)
      logger.info(movie.id)
      await MoviesFound.create({
        userId: user.id,
        movieId: movie.id,
      })
    }

    const moviesFound = await MoviesFound.query().where('user_id', user.id).select('movie_id')
    const moviesFoundIds = moviesFound.map((mf) => mf.movieId)

    const movies = await Movie.query().whereNotIn('id', moviesFoundIds)

    if (movies.length === 0) {
      return response.redirect('/end-page')
    }

    const randomMovieIndex = randomPick(movies.length)
    const newMovieSelected = movies[randomMovieIndex]
    session.put('movieSelected', newMovieSelected)

    return view.render('game', {
      movieSelected: newMovieSelected,
      score: user.score,
      message: isCorrect ? 'Bonne réponse ! 🎉' : 'Mauvaise réponse 😞',
      correctAnswer: movie.name,
    })
  }
}
