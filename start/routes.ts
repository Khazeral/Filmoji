const MovieController = () => import('#controllers/movies_controller')
const SessionController = () => import('#controllers/session_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.get('/game', [MovieController, 'initializeGame'])

router.get('/', [MovieController, 'showHomePage'])

router.get('/restart', [MovieController, 'restartGame'])

router.post('/movies/check', [MovieController, 'checkAnswer'])

router.post('/login', [SessionController, 'login'])
router.get('/login', async ({ view }) => {
  return view.render('login')
})

router.post('/register', [SessionController, 'register'])
router.get('/register', async ({ view }) => {
  return view.render('register')
})

router.get('/logout', [SessionController, 'logout']).use(middleware.auth())
