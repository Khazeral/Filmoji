import Movie from '#models/movie'
import { HttpContext } from '@adonisjs/core/http'
import { getLevenshteinDistance } from '../utils/levenshtein_distance.js'
import MoviesFound from '#models/movies_found'
import User from '#models/user'

export default class MovieController {
  public async initializeGame({ view, session, request, auth }: HttpContext) {
    let user = session.get('user')
    let isAuthenticated = false

    const userIdFromCookie = request.cookie('user_id')

    if (userIdFromCookie) {
      const userFromDb = await User.find(userIdFromCookie)

      if (userFromDb) {
        await auth.use('web').login(userFromDb)
        user = { id: userFromDb.id, score: userFromDb.score }
        isAuthenticated = true
      }
    }

    if (!user || user.id === -1) {
      user = { id: -1, score: 0 }
      session.put('user', user)
    }

    const resolvedMovies =
      user.id !== -1 ? await MoviesFound.query().where('user_id', user.id).select('movie_id') : []

    const resolvedMovieIds = resolvedMovies.map((movie) => movie.movieId)
    const movies = await Movie.query().whereNotIn('id', resolvedMovieIds)

    if (movies.length === 0) {
      return view.render('end_game', { message: 'Vous avez résolu tous les films ! 🎉' })
    }

    const randomMovieIndex = Math.floor(Math.random() * movies.length)
    const movieSelected = movies[randomMovieIndex]
    session.put('movieSelected', movieSelected)

    return view.render('game', {
      isAuthenticated: isAuthenticated,
      movieSelected: movieSelected,
      score: user.score,
    })
  }

  public async checkAnswer({ request, response, session, view, auth }: HttpContext) {
    let isAuthenticated = false
    let user = session.get('user')
    const userIdFromCookie = request.cookie('user_id')

    if (userIdFromCookie) {
      const userFromDb = await User.find(userIdFromCookie)

      if (userFromDb) {
        await auth.use('web').login(userFromDb)
        user = { id: userFromDb.id, score: userFromDb.score }
        isAuthenticated = true
      }
    }

    if (!user || user.id === -1) {
      user = { id: -1, score: 0 }
      session.put('user', user)
    }

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
        score: user.score,
      })
    }

    if (isCorrect) {
      session.put('movieSelected', nextMovie)
    }

    return view.render('game', {
      isAuthenticated: isAuthenticated,
      movieSelected: session.get('movieSelected'),
      score: user.score,
      correctAnswer: movie.name,
    })
  }

  private async handleCorrectAnswer(user, movie, session) {
    user.score += 1

    if (user.id === -1) {
      const moviesFound = session.get('MovieFound') || []
      session.put('MovieFound', [...moviesFound, movie.id])
    } else {
      await MoviesFound.create({
        userId: user.id,
        movieId: movie.id,
      })

      const dbUser = await User.find(user.id)
      if (dbUser) {
        dbUser.score = user.score
        await dbUser.save()
      }
    }

    this.updateSessionUser(session, user)
  }

  private async getNextMovie(user, session) {
    let movies

    if (user.id === -1) {
      const moviesFound = session.get('MovieFound') || []
      movies = await Movie.query().whereNotIn('id', moviesFound)
    } else {
      const moviesFound = await MoviesFound.query().where('user_id', user.id).select('movie_id')
      const movieIds = moviesFound.map((mf) => mf.movieId)
      movies = await Movie.query().whereNotIn('id', movieIds)
    }

    if (movies.length === 0) {
      return null
    }

    const randomIndex = Math.floor(Math.random() * movies.length)
    return movies[randomIndex]
  }

  public async restartGame({ session, response }: HttpContext) {
    const user = session.get('user')

    if (user) {
      if (user.id !== -1) {
        await MoviesFound.query().where('user_id', user.id).delete()

        const userToUpdate = await User.find(user.id)
        if (userToUpdate) {
          userToUpdate.score = 0
          await userToUpdate.save()
        }
      }

      session.put('user', { ...user, score: 0 })
      session.forget('movieSelected')
      session.forget('MovieFound')
    }

    return response.redirect('/game')
  }

  private updateSessionUser(session, user) {
    session.put('user', { id: user.id, score: user.score })
  }
}
