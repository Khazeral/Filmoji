import { HttpContext } from '@adonisjs/core/http'

export default class GamesController {
  public async startGame({ session, response }: HttpContext) {
    let userId = session.get('user_id')
    if (!userId) {
      userId = `anon_${Math.random().toString(36).substr(2, 9)}`
      session.put('user_id', userId)
    }

    let score = session.get('score', 0)

    return response.json({ userId, score })
  }

  public async updateScore({ session, request, response }: HttpContext) {
    const newScore = request.input('score')

    session.put('score', newScore)

    return response.json({ success: true, newScore })
  }

  public async getScore({ session, response }: HttpContext) {
    const score = session.get('score', 0)

    return response.json({ score })
  }
}
