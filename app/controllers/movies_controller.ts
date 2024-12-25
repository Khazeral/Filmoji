import Movie from '#models/movie'
import { HttpContext } from '@adonisjs/core/http'
import { getLevenshteinDistance } from '../utils/levenshtein_distance.js'
import MoviesFound from '#models/movies_found'
import User from '#models/user'
import UsersController, { AnonymousUser, AuthenticatedUser } from './users_controller.js'
import { Session } from '@adonisjs/session'

const USER_NOT_REGISTRED_ID = -1
const userController = new UsersController()

export default class MovieController {
  public async initializeGame({ view, session, request }: HttpContext) {
    const { userData, isAuthenticated } = await userController.getUser(session, request)
    if (isAuthenticated) {
      const movie = await this.getNextMovie(userData, session)
      if (movie === null) {
        return view.render('end_game', {
          message: 'Vous avez résolu tous les films ! 🎉',
          score: userData.score,
        })
      }

      return view.render('game', {
        isAuthenticated: isAuthenticated,
        movieSelected: movie,
        score: userData.score,
      })
    } else {
      if (userData.id === USER_NOT_REGISTRED_ID) {
        const anonymousUser = { id: USER_NOT_REGISTRED_ID, score: 0 }
        session.put('user', anonymousUser)
      }

      const movie = await this.getNextMovie(userData, session)

      if (movie === null) {
        return view.render('end_game', {
          message: 'Vous avez résolu tous les films ! 🎉',
          score: userData.score,
        })
      }

      session.put('movieSelected', movie)

      return view.render('game', {
        isAuthenticated: isAuthenticated,
        movieSelected: movie,
        score: userData.score,
      })
    }
  }

  public async checkAnswer({ request, response, session, view }: HttpContext) {
    const user = await userController.getUser(session, request)
    const movieSelected = session.get('movieSelected')
    const userAnswer = request.input('user_answer')

    const movie = await Movie.find(movieSelected.id)
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

    if (isCorrect) {
      session.put('movieSelected', nextMovie)
    }

    return view.render('game', {
      movieSelected: session.get('movieSelected'),
      score: user.userData.score,
      correctAnswer: movie.name,
    })
  }

  private async handleCorrectAnswer(
    user: AuthenticatedUser | AnonymousUser,
    movie: Movie,
    session: Session
  ) {
    const { userData, isAuthenticated } = user
    if (isAuthenticated && userData instanceof User) {
      await MoviesFound.create({
        userId: userData.id,
        movieId: movie.id,
      })
      userData.score += 1
      await userData.save()
    } else {
      const moviesFound = session.get('MovieFound') || []
      session.put('MovieFound', [...moviesFound, movie.id])
      userData.score += 1
      session.put('user', userData)
    }
  }

  private async getNextMovie(user: AuthenticatedUser | AnonymousUser, session: Session) {
    let movies

    if (user.isAuthenticated) {
      const moviesFound = await MoviesFound.query()
        .where('user_id', user.userData.id)
        .select('movie_id')
      const movieIds = moviesFound.map((mf) => mf.movieId)
      movies = await Movie.query().whereNotIn('id', movieIds)
    } else {
      const moviesFound = session.get('MovieFound') || []
      movies = await Movie.query().whereNotIn('id', moviesFound)
    }
    if (movies.length === 0) {
      return null
    }
    const randomIndex = Math.floor(Math.random() * movies.length)
    return movies[randomIndex]
  }

  public async restartGame({ session, response, request }: HttpContext) {
    const { userData, isAuthenticated } = await userController.getUser(session, request)

    if (isAuthenticated) {
      await MoviesFound.query().where('user_id', userData.id).delete()

      userData.score = 0
      await userData.save()
    } else {
      session.put('user', { ...userData, score: 0 })
      session.forget('movieSelected')
      session.forget('MovieFound')
    }

    return response.redirect('/game')
  }
}
