import User from '#models/user'
import { HttpContext, Request } from '@adonisjs/core/http'
import { Session } from '@adonisjs/session'

const USER_NOT_REGISTRED_ID = -1

export type AnonymousUser = {
  userData: {
    id: number
    score: number
  }
  isAuthenticated: boolean
}

export type AuthenticatedUser = {
  userData: User
  isAuthenticated: boolean
}

export default class UsersController {
  public async getUser(
    session: Session,
    request: Request
  ): Promise<{ userData: User; isAuthenticated: boolean }> {
    const userIdFromCookie = request.cookie('user_id')
    if (userIdFromCookie) {
      const userFromDb = await User.find(userIdFromCookie)
      if (userFromDb) {
        return { userData: userFromDb, isAuthenticated: true }
      }
    }

    let user = session.get('user')
    if (!user || user.id === undefined) {
      user = { id: USER_NOT_REGISTRED_ID, score: 0 }
      session.put('user', user)
    }
    return { userData: user, isAuthenticated: false }
  }

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
