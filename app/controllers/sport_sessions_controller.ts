import type { HttpContext } from '@adonisjs/core/http'
import {
  storeSportSessionValidator,
  updateSportSessionValidator,
  filterSessionsValidator,
} from '#validators/sport_session'
import SportSession from '#models/sport_session'
import SessionMember from '#models/session_member'
import Sport from '#models/sport'
import { DateTime } from 'luxon'
import Status from '../enums/sport_session.js'
import UserStatus from '../enums/user.js'

export default class SportSessionsController {
  /**
   * Display a list of resource
   */
  async index({ auth, response }: HttpContext) {
    const user = auth.user!

    try {
      console.log('User status:', user.status)

      // Définir la variable now et la formater
      const now = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')

      const sportSessionsQuery = SportSession.query()
        .where('status', Status.PENDING)
        .andWhere('isPrivate', false)
        .whereRaw(
          '(SELECT COUNT(*) FROM session_members WHERE session_members.session_id = sport_sessions.id) < sport_sessions.max_participants'
        )
        .whereRaw('start_date > ?', [now]) // Compare directly with the timestamp

      // Ajouter condition pour onlyBlindOrVisuallyImpaired en fonction du statut de l'utilisateur
      if (user.status === UserStatus.VALIDE) {
        sportSessionsQuery.where('onlyBlindOrVisuallyImpaired', false)
      }

      // Log the query to see what is being sent to the database
      console.log('Query:', sportSessionsQuery.toSQL().toNative())

      const sportSessions = await sportSessionsQuery.preload('members')

      return response.json(sportSessions)
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions :', error)
      return response.badGateway({ message: error.message })
    }
  }

  /**
   * Récupérer la dernière session créée par l'utilisateur authentifié
   */
  async getLastCreatedSession({ auth, response }: HttpContext) {
    try {
      const user = auth.user!

      // Récupérer la dernière session créée par l'utilisateur
      const lastSession = await SportSession.query()
        .whereHas('members', (membersQuery) => {
          membersQuery.where('userId', user.id).andWhere('isAdmin', true)
        })
        .orderBy('created_at', 'desc')
        .preload('sport')
        .preload('members', (membersQuery) => {
          // On récupère le nom, prénom et image de profile du créateur de la session
          membersQuery
            .preload('user', (userQuery) => {
              userQuery.select('firstname', 'lastname', 'profilImage')
            })
            .where('isAdmin', true)
        })
        .first()
      // Pour récupèrer toutes les infos du créateur de la session
      // .preload('members', (membersQuery) => {
      //   membersQuery.preload('user')
      // }).first()

      if (!lastSession) {
        return response.notFound({ message: 'Aucune session trouvée.' })
      }

      return response.ok(lastSession)
    } catch (error) {
      console.error('Erreur lors de la récupération de la dernière session :', error)
      return response.badGateway({
        message: 'Erreur lors de la récupération de la dernière session.',
      })
    }
  }

  async filterSessions({ request, auth, response }) {
    const payload = await request.validateUsing(filterSessionsValidator)
    const { latitude, longitude, sportIdGroup, distanceFilter } = payload

    // Utilisez des valeurs par défaut si l'utilisateur ne donne pas sa localisation
    const userLatitude = latitude ?? -34.397 // Valeur par défaut
    const userLongitude = longitude ?? 151.644 // Valeur par défaut

    if (!sportIdGroup || sportIdGroup.length === 0) {
      return response.badRequest({ message: 'Sport IDs are required' })
    }

    if (!distanceFilter) {
      return response.badRequest({ message: 'Distance filter is required' })
    }

    const now = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')

    try {
      let sportSessions = await SportSession.query()
        .whereIn('sportId', sportIdGroup)
        .andWhere('status', Status.PENDING)
        .andWhere('isPrivate', false)
        .andWhere('start_date', '>=', now)
        .andWhereRaw(
          `(SELECT COUNT(*) FROM session_members WHERE session_members.session_id = sport_sessions.id) < sport_sessions.max_participants`
        )
        .andWhereRaw(
          `ST_Distance(geo_location_point, ST_SetSRID(ST_MakePoint(?,?,4326),?)) <=?`,
          [userLongitude, userLatitude, 4326, distanceFilter * 1000] // Convertissez la distanceFilter en mètres
        )
        .as('*') // Assurez-vous de retourner tous les champs

      // Convertir la distance en kilomètres
      sportSessions = sportSessions.map((session) => ({
        ...session,
        distance: session.distance / 100000, // Convertir la distance en mètres en kilomètres
      }))

      return response.ok(sportSessions)
    } catch (error) {
      console.error('Error fetching filtered sessions:', error)
      return response.badGateway({ message: error.message })
    }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const payload = await request.validateUsing(storeSportSessionValidator)

      // Vérifier si le sport existe
      const sport = await Sport.findOrFail(payload.sportId)
      if (!sport) {
        return response.badRequest({ message: 'Sport non trouvé' })
      }

      // Validation de la latitude et longitude
      if (payload.latitude === null || payload.longitude === null) {
        return response.badRequest({ message: 'Votre adresse invalide' })
      }

      // Construire un point géographique à partir des coordonnées
      const geoLocationPoint = `POINT(${payload.longitude} ${payload.latitude})`

      // Convertir startDate en DateTime de Luxon
      if (!payload.startDate) {
        return response.badRequest({ message: 'Date de début est requise' })
      }
      const startDate = DateTime.fromISO(payload.startDate)

      // Vérifier que la date de début est dans le futur
      const now = DateTime.now()
      if (startDate < now) {
        return response.badRequest({ message: 'La date de session doit être actuelle ou futur.' })
      }

      const diffInMinutes = startDate.diff(now, 'minutes').minutes
      if (diffInMinutes <= 60) {
        return response.badRequest({
          message: 'Vous ne pouvez pas créer une session moins de 1 heure avant le début.',
        })
      }

      // Créer la session sportive
      const sportSession = await SportSession.create({
        ...payload,
        geoLocationPoint,
      })

      // Ajouter l'utilisateur comme membre administrateur de la session
      await SessionMember.create({
        sessionId: sportSession.id,
        userId: user.id,
        isAdmin: true,
        isAccepted: true,
      })

      return response.ok({ message: 'Nouvelle session de sport ajoutée avec succès.' })
    } catch (error) {
      console.log('Erreur lors de la création de la session:', error)
      return response.badGateway({ message: error.message })
    }
  }

  /**
   * Update de la session de sport
   */
  async update({ request, auth, response, bouncer }: HttpContext) {
    try {
      const user = auth.user!
      const payload = await request.validateUsing(updateSportSessionValidator)

      const { sessionId } = payload
      console.log({ sessionId })

      // On récupère la session de sport qui doit être update
      const sportSession = await SportSession.findOrFail(sessionId) // findOrFail: id Find

      // Vérifiez si l'utilisateur a l'autorisation de modifier la session
      //await bouncer.authorize('isAdmin', sportSession)

      // on supprime sessionId pour ne pas le renvoyer au backend
      delete payload.sessionId

      // *******************************REMPLACER PAR LA POLICY
      const isAdmin = await SessionMember.query()
        .where('sessionId', sportSession.id)
        .andWhere('userId', user.id)
        .andWhere('isAdmin', true)
        .first()

      if (!isAdmin) {
        return response.unauthorized({
          message: 'Vous devez être administrateur de la session pour la modifier.',
        })
      }
      // *******************************REMPLACER PAR LA POLICY

      await sportSession.merge(payload).save()

      return response.ok({ message: 'Session mise à jour avec succès.', data: sportSession })
    } catch (error) {
      console.log()

      console.error('Erreur lors de la mise à jour de la session :', error)
      return response.badGateway({ message: error.message })
    }
  }

  /**
   * Supression de la session de sport
   */
  async destroy({ request, auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const { sessionId } = request.only(['sessionId'])

      // On récupère la session de sport à supprimer
      const sportSession = await SportSession.findOrFail(sessionId)

      // On vérifie que l'utilisateur est admin de la session
      const isAdmin = await SessionMember.query()
        .where('sessionId', sportSession.id)
        .andWhere('userId', user.id)
        .andWhere('isAdmin', true)
        .first()

      if (!isAdmin) {
        return response.unauthorized({
          message: 'Vous devez être administrateur de la session pour la supprimer.',
        })
      }

      // On supprime la session
      await sportSession.delete()
      return response.ok({ message: 'Session supprimée avec succès.' })
    } catch (error) {
      console.error('Erreur lors de la suppression de la session :', error)
      return response.badGateway({ message: error.message })
    }
  }
}
