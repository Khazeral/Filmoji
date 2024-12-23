const MovieController = () => import('#controllers/movies_controller')
const SessionController = () => import('#controllers/session_controller')
import router from '@adonisjs/core/services/router'

router.get('/', [MovieController, 'initializeGame'])

router.post('/movies/check', [MovieController, 'checkAnswer'])

router.get('/login-page', async ({ view }) => {
  return view.render('login')
})

router.post('/login', [SessionController, 'login'])
router.post('/register', [SessionController, 'register'])
router.get('/register-page', async ({ view }) => {
  return view.render('register')
})

router.get('/end-page', async ({ view }) => {
  return view.render('end_game')
})
