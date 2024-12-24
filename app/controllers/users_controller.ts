import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  public async incrementUserScore(userId: string, { session }: HttpContext): Promise<User> {
    const user = await User.findByOrFail('id', userId)

    user.score += 1
    await user.save()

    const sessionUser = session.get('user')
    if (sessionUser) {
      session.put('user', { ...sessionUser, score: user.score })
    }

    return user
  }
}
