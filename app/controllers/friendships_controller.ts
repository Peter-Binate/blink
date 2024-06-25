import type { HttpContext } from '@adonisjs/core/http'
import Friendship from '#models/friendship'
import User from '#models/user'
import Status from '../enums/friendship.js'
import { StreamChat } from 'stream-chat'
import { cuid } from '@adonisjs/core/helpers'
import env from '#start/env'
//import Friendships from '#models/friendships'

export default class FriendshipsController {
  /**
   * Récupére tous les amis de l'utilisateur authentifié
   */
  async getAllFriends({ auth, response }: HttpContext) {
    const userId = auth.user?.id
    if (!userId) {
      return response.unauthorized({ message: 'User not authenticated' })
    }

    try {
      // Récupérer toutes les relations d'amitié où l'utilisateur est impliqué
      const friendships = await Friendship.query()
        .where((builder) => {
          builder.where('sender_user_id', userId).orWhere('receiver_user_id', userId)
        })
        .andWhere('status', 'accepted')

        .preload('receiver', (query) => {
          // Pas besoin de vérifier l'ID ici, juste sélectionner les champs nécessaires
          query.select('username', 'profilImage')
        })

      // Préparer une liste des amis
      const friends = friendships.map((friendship) => {
        return friendship.senderUserId === userId ? friendship.receiver : friendship.sender
      })

      return response.ok(friends)
    } catch (error) {
      return response.badRequest({ message: error.message })
    }
  }

  /**
   * On récupère les demandes d'amis envoyé par d'autre user
   */
  async getReceivedFriendRequests({ auth, response }: HttpContext) {
    const receiverUserId = auth.user?.id
    if (!receiverUserId) {
      return response.unauthorized({ message: 'User not authenticated' })
    }

    // On récupère toutes les demandes d'amis reçues
    const receivedFriendRequests = await Friendship.query()
      .where('receiver_user_id', receiverUserId)
      .andWhere('status', Status.PENDING)
    //.preload('user') // Précharge les informations de l'utilisateur qui a envoyé la demande ne fonctionne pas

    return response.ok(receivedFriendRequests)
  }

  /**
   * Handle form submission for the create action
   */
  async friendshipRequest({ auth, response, request }: HttpContext) {
    try {
      // On vérifie que l'utilisateur est authentifié
      const senderUserId = auth.user?.id
      // Si l'utilisateur n'existe pas
      if (!senderUserId) {
        return response.unauthorized({ message: 'User not authenticated' })
      }

      // On récupère l'id de l'utilisateur receveur depuis le corps de la requête
      const { receiverUserId } = request.only(['receiverUserId'])

      // Vérifier si l'utilisateur tente d'envoyer une demande à lui-même
      if (Number(senderUserId) === Number(receiverUserId)) {
        return response.badRequest({
          message: "Vous ne pouvez pas envoyer une demande d'ami à vous-même",
        })
      }

      // On vérifie si l'utilisateur receveur existe par son id
      await User.findOrFail(receiverUserId) // s'il n'existe pas on aura une exception

      // On vérifie qu'il n'existe pas déjà une demande d'amis entre utilisateurs
      const existingFriendship = await Friendship.query()
        .where((builder) => {
          builder
            .where('sender_user_id', senderUserId)
            .andWhere('receiver_user_id', receiverUserId)
            .orWhere('sender_user_id', receiverUserId)
            .andWhere('receiver_user_id', senderUserId)
        })
        .first()

      // S'il existe déjà une demande en attente
      if (existingFriendship) {
        return response.badRequest({
          message: "Une demande d'amis existe déjà entre ces utilisateurs",
        })
      }

      // On crée une nouvelle demande d'amis
      await Friendship.create({
        senderUserId: senderUserId,
        receiverUserId: receiverUserId,
      })
      return response.created({ message: "Demande d'amis envoyée" })
    } catch (error) {
      return response.badRequest({ message: error.message })
    }
  }

  //   /**
  //    * Accepter une demande d'amis
  //    */
  async acceptFriendRequest({ auth, request, response }: HttpContext) {
    const receiverUserId = auth.user?.id
    if (!receiverUserId) {
      return response.unauthorized({ message: 'User not authenticated' })
    }

    try {
      // On récupère l'ID de l'utilisateur envoyant la demande depuis le corps de la requête
      const { senderUserId } = request.only(['senderUserId'])

      // On récupère la demande d'amitié en fonction des IDs
      const friendship = await Friendship.query()
        .where('sender_user_id', senderUserId)
        .andWhere('receiver_user_id', receiverUserId)
        .andWhere('status', Status.PENDING)
        .firstOrFail()

      // On met à jour le statut de la demande à ACCEPTED
      friendship.status = Status.ACCEPTED
      await friendship.save()

      // On récupère la clé et le secret de l'API stream
      const streamApiKey = env.get('STREAM_API_KEY')
      const streamApiSecret = env.get('STREAM_API_SECRET')

      if (!streamApiKey || !streamApiSecret) {
        throw new Error(
          'STREAM_API_KEY or STREAM_API_SECRET is not defined in environment variables.'
        )
      }

      // Création d'une instance du client StreamChat avec les clés API
      const chatClient = StreamChat.getInstance(streamApiKey, streamApiSecret)

      const channelId = `friends-${cuid()}`
      const channel = chatClient.channel('messaging', channelId, {
        created_by_id: receiverUserId.toString(),
        members: [senderUserId.toString(), receiverUserId.toString()],
      })

      await channel.create()

      return response.ok({ message: 'Friend request accepted' })
    } catch (error) {
      return response.badRequest({ message: error.message })
    }
  }

  //   /**
  //    * On supprime un ami
  //    */
  async deleteFriend({ auth, request, response }: HttpContext) {
    const userId = auth.user?.id
    // Si l'utilisateur n'est pas authentifié
    if (!userId) {
      return response.unauthorized({ message: 'User not authenticated' })
    }

    const { friendId } = request.only(['friendId'])

    try {
      const friendshipToDelete = await Friendship.query()
        .where((builder) => {
          builder
            .where('sender_user_id', userId)
            .andWhere('receiver_user_id', friendId)
            .orWhere('sender_user_id', friendId)
            .andWhere('receiver_user_id', userId)
        })
        .firstOrFail()

      await friendshipToDelete.delete()
      return response.ok({ message: 'Friend is delete' })
    } catch (error) {
      return response.badRequest({ message: error.message })
    }
  }
}
