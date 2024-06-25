/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const AuthController = () => import('#controllers/auth_controller')
const UserFavoriteSportsController = () => import('#controllers/user_favorite_sports_controller')
const SportsListsController = () => import('#controllers/sports_lists_controller')
const SportSessionsController = () => import('#controllers/sport_sessions_controller')
const FriendshipsController = () => import('#controllers/friendships_controller')
const HandleSessionMembersController = () => import('#controllers/session_members_controller')

// Routes ne nécessitant pas d'authentification
router
  .group(() => {
    router.post('register', [AuthController, 'handleRegister'])
    router.post('login', [AuthController, 'handleLogin'])
    router.post('check-email', [AuthController, 'checkEmail'])
  })
  .prefix('/api/auth')

// Routes nécessitant une authentification
router
  .group(() => {
    router.get('profile', [AuthController, 'getUserProfile'])
    router.put('edit', [AuthController, 'handleEditAccount'])
    router.delete('delete', [AuthController, 'handleDeleteAccount'])
    router.delete('logout', [AuthController, 'handleLogout'])
  })
  .use(middleware.auth())
  .prefix('/api/auth')

// Route pour obtenir la liste de tous les sports
router.get('/all', [SportsListsController, 'index']).use(middleware.auth()).prefix('api/sports')

// Route pour gérer ses sports préférés
router
  .group(() => {
    router.get('get', [UserFavoriteSportsController, 'index'])
    router.post('add', [UserFavoriteSportsController, 'store'])
    router.put('update', [UserFavoriteSportsController, 'update'])
    router.delete('delete', [UserFavoriteSportsController, 'destroy'])
  })
  .use(middleware.auth())
  .prefix('api/user/lovedsports')

// Route pour gérer les sessions de sports
router
  .group(() => {
    router.post('search', [SportSessionsController, 'filterSessions'])
    router.post('create', [SportSessionsController, 'store'])
    router.put('/update', [SportSessionsController, 'update'])
    router.delete('delete', [SportSessionsController, 'destroy'])
  })
  .use(middleware.auth())
  .prefix('api/sport-session')

// Route pour gérer la liste d'amis
router
  .group(() => {
    router.get('received-requests', [FriendshipsController, 'getReceivedFriendRequests'])
    router.post('send-request/', [FriendshipsController, 'friendshipRequest'])
    router.post('accept-friend/', [FriendshipsController, 'acceptFriendRequest'])
    router.delete('delete/', [FriendshipsController, 'deleteFriend'])
  })
  .use(middleware.auth())
  .prefix('api/friendship')
