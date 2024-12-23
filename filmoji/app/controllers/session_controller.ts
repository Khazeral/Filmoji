import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'

export default class SessionController {
  async login({ request, auth, response, session }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    const user = await User.verifyCredentials(email, password)
    await auth.use('web').login(user)
    logger.info(user)
    session.put('user', {
      id: user.id,
      email: user.email,
      score: user.score,
    })
    response.redirect('/')
  }

  public async register({ request, auth, response, session }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    const existingUser = await User.findBy('email', email)
    if (existingUser) {
      return response.status(400).send({ error: 'Cet email est déjà utilisé.' })
    }

    const user = await User.create({
      email,
      password,
    })

    const userData = await User.findBy('id', user.id)
    await auth.use('web').login(user)
    session.put('user', {
      id: user.id,
      email: user.email,
      score: userData!.score ?? 0,
    })

    response.redirect('/')
  }
}
