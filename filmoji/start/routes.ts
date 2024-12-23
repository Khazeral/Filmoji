const MovieController = () => import('#controllers/movies_controller')
const SessionController = () => import('#controllers/session_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.get('/game', [MovieController, 'initializeGame'])

router.get('/', async ({ view }) => {
  return view.render('home')
})

router.post('/movies/check', [MovieController, 'checkAnswer'])

router.get('/login-page', async ({ view }) => {
  return view.render('login')
})

router.post('/login', [SessionController, 'login'])
router.post('/register', [SessionController, 'register'])
router.get('/logout', [SessionController, 'logout']).use(middleware.auth())
router.get('/register-page', async ({ view }) => {
  return view.render('register')
})

router.post('/game/restart', [MovieController, 'restartGame'])

router.get('/end-page', async ({ view }) => {
  return view.render('end_game')
})
