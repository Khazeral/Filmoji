import Movie from '#models/movie'
import { HttpContext } from '@adonisjs/core/http'
import { getLevenshteinDistance } from '../utils/levenshtein_distance.js'
import UsersController from './users_controller.js'
import { Session } from '@adonisjs/session'
import User from '#models/user'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'

const USER_NOT_REGISTERED_ID = -1
const userController = new UsersController()

export default class MovieController {
  public async initializeGame({ view, session, request }: HttpContext) {
    const user = await userController.getUser(session, request)

    if (!user.isAuthenticated) {
      session.put('user', { id: USER_NOT_REGISTERED_ID, score: 0 })
    }

    const movie = await this.getNextMovie(user, session)
    if (!movie) {
      return view.render('end_game', {
        message: 'Vous avez résolu tous les films ! 🎉',
        score: user.userData.score,
      })
    }

    if (user.isAuthenticated) {
      await db
        .from('user_movies')
        .where('movie_id', movie.id)
        .where('user_id', user.userData.id)
        .update({
          been_found: true,
          is_target: false,
        })
    } else {
      session.put('movieSelected', movie)
    }

    return view.render('game', {
      isAuthenticated: user.isAuthenticated,
      movieSelected: movie,
      score: user.userData.score,
    })
  }

  public async checkAnswer({ request, response, session, view }: HttpContext) {
    const user = await userController.getUser(session, request)
    const userAnswer = request.input('user_answer')

    const movie = user.isAuthenticated
      ? await user.userData.related('userMovies').query().where({ is_target: true }).first()
      : session.get('movieSelected')

    if (!movie) {
      return response.status(404).send({ error: 'Film non trouvé' })
    }

    const distance = getLevenshteinDistance(userAnswer.toLowerCase(), movie.name.toLowerCase())
    const isCorrect = distance <= 3

    if (isCorrect) {
      await this.handleCorrectAnswer(user, movie, session)
    }

    const nextMovie = await this.getNextMovie(user, session)
    if (!nextMovie) {
      return view.render('end_game', {
        message: 'Vous avez résolu tous les films ! 🎉',
        score: user.userData.score,
      })
    }

    if (user.isAuthenticated) {
      await user.userData.related('userMovies').attach({
        [nextMovie.id]: { been_found: true, is_target: false },
      })
    } else {
      session.put('movieSelected', nextMovie)
    }

    return view.render('game', {
      movieSelected: nextMovie,
      score: user.userData.score,
      correctAnswer: movie.name,
      isAuthenticated: user.isAuthenticated,
    })
  }

  private async handleCorrectAnswer(
    user: { userData: User; isAuthenticated: boolean },
    movie: Movie,
    session: Session
  ) {
    if (user.isAuthenticated) {
      await db
        .from('user_movies')
        .where('movie_id', movie.id)
        .where('user_id', user.userData.id)
        .update({
          been_found: true,
          is_target: false,
        })

      user.userData.score += 1
      await user.userData.save()
    } else {
      const moviesFound = session.get('MovieFound') || []
      session.put('MovieFound', [...moviesFound, movie.id])

      user.userData.score += 1
      session.put('user', user.userData)
    }
  }

  private async getNextMovie(user, session) {
    let moviesQuery

    if (user.isAuthenticated) {
      moviesQuery = await user.userData.related('userMovies').query().where('been_found', false)
    } else {
      const movieFound = session.get('MovieFound') || []
      const moviesList = await Movie.all()
      moviesQuery = moviesList.filter((movie) => !movieFound.includes(movie.id))
    }
    if (moviesQuery.length === 0) return null

    return moviesQuery[Math.floor(Math.random() * moviesQuery.length)]
  }

  public async restartGame({ session, response, request }: HttpContext) {
    const user = await userController.getUser(session, request)

    if (user.isAuthenticated) {
      await user.userData.related('userMovies').detach()
      user.userData.score = 0
      await user.userData.save()
    } else {
      session.put('user', { id: USER_NOT_REGISTERED_ID, score: 0 })
      session.forget('movieSelected')
      session.forget('MovieFound')
    }

    return response.redirect('/game')
  }
}
