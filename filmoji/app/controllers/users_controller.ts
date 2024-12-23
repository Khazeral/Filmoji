import User from '#models/user'

export default class UsersController {
  public async incrementUserScore(userId: string): Promise<User> {
    const user = await User.findByOrFail('id', userId)
    user.score = user.score + 1
    await user.save()
    return user
  }
}
