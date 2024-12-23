import Movie from '#models/movie'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class MovieSeeder extends BaseSeeder {
  public async run() {
    const movies = [
      { name: 'The Lion King', emojis: '🦁👑🌅' },
      { name: 'Titanic', emojis: '🚢💔🌊' },
      { name: 'Star Wars', emojis: '🌌⚔️🚀' },
      { name: 'Jurassic Park', emojis: '🦖🦕🌴' },
      { name: 'Frozen', emojis: '❄️⛄👸' },
      { name: 'Finding Nemo', emojis: '🐟🔍🌊' },
      { name: 'The Matrix', emojis: '💻🕶️🔫' },
      { name: 'Harry Potter', emojis: '🪄⚡🎓' },
      { name: 'Avengers', emojis: '🛡️💥🌍' },
      { name: 'Coco', emojis: '🎸💀🌼' },
    ]

    await Movie.createMany(movies)
  }
}
