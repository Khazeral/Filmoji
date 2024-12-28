import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  async login({ request, auth, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    const user = await User.verifyCredentials(email, password)
    response.cookie('user_id', user.id, { httpOnly: true, secure: true })
    await auth.use('web').login(user)
    response.redirect('/game')
  }

  public async register({ request, auth, response, session }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    const existingUser = await User.findBy('email', email)
    if (existingUser) {
      return response.status(400).send({ error: 'Cet email est déjà utilisé.' })
    }

    const datasBeforeRegister = session.get('user')

    const user = await User.create({
      email,
      password,
      score: datasBeforeRegister.score ?? 0,
    })

    await auth.use('web').login(user)
    response.cookie('user_id', user.id, { httpOnly: true, secure: true })
    if (datasBeforeRegister.score > 0) {
      response.redirect('/game')
    } else {
      response.redirect('/')
    }
  }

  public async logout({ session, response }: HttpContext) {
    session.forget('user')
    response.redirect('/')
  }
}
