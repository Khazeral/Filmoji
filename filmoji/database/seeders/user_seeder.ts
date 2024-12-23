import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    // Créez un ensemble d'utilisateurs de démonstration
    await User.createMany([
      {
        fullName: 'Alice Dupont',
        email: 'alice@example.com',
        password: 'password123', // Assurez-vous que votre modèle gère le hachage
        score: 10,
      },
      {
        fullName: 'Bob Martin',
        email: 'bob@example.com',
        password: 'securepass456',
        score: 20,
      },
      {
        fullName: 'Charlie Durant',
        email: 'charlie@example.com',
        password: 'mypassword789',
        score: 15,
      },
    ])
  }
}
