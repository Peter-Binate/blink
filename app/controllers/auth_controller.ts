import User from '#models/user'
import app from '@adonisjs/core/services/app'
import { registerUserValidator, loginUserValidator, updateUserValidator } from '#validators/auth'
import { StreamChat } from 'stream-chat'
import { uploadImageToS3 } from '#services/as3_service'
import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'
import { toPng } from 'jdenticon'
import { unlink } from 'node:fs/promises'
import { writeFile } from 'node:fs/promises' // Utilisez la version promise pour gérer les opérations de manière asynchrone

// On récupère la clé et le secret de l'API stream
const streamApiKey = env.get('STREAM_API_KEY')
const streamApiSecret = env.get('STREAM_API_SECRET')

if (!streamApiKey || !streamApiSecret) {
  throw new Error('STREAM_API_KEY or STREAM_API_SECRET is not defined in environment variables.')
}

// Création d'une instance du client StreamChat avec les clés API
const streamClient = StreamChat.getInstance(streamApiKey, streamApiSecret)

export default class AuthController {
  // Inscription de l'utilisateur
  async handleRegister({ request, response }: HttpContext) {
    const bucketName = env.get('AWS_BUCKET_NAME')

    if (!bucketName) {
      return response.status(500).json({
        error: 'AWS_BUCKET_NAME is not defined in environment variables.',
      })
    }

    // On récupère les informations validées
    const payload = await request.validateUsing(registerUserValidator)
    const { profilImage, firstname } = payload

    try {
      let imageUrl

      if (!profilImage) {
        // On génère une icône par défaut et l'enregistre
        const png = toPng(firstname, 100)
        const filename = `${firstname}_${cuid()}.png`
        const tempFilePath = `public/users/${filename}`
        // Enregistre l'image par défaut dans un fichier temporaire
        await writeFile(tempFilePath, png)
        imageUrl = await uploadImageToS3(tempFilePath, bucketName, filename)
        await unlink(tempFilePath) // Supprime le fichier temporaire après l'upload
      } else {
        // Gérer l'upload de l'image de profilImage
        const filename = `${cuid()}_${Date.now()}.${profilImage.extname}` // On génère un nom unique
        const tempFilePath = `public/users/${filename}`
        await profilImage.move(app.makePath('public/users'), { name: filename })
        imageUrl = await uploadImageToS3(tempFilePath, bucketName, filename)
      }

      // Log pour débogage
      console.log('Payload received:', payload)

      // Création du point géographique à partir des coordonnées latitude et longitude
      if (!payload.latitude || !payload.longitude) {
        return response.badRequest({ message: 'Latitude and longitude are required' })
      }
      const geoLocationPoint = `POINT(${payload.longitude} ${payload.latitude})`

      // Log pour débogage
      console.log('Geolocation point:', geoLocationPoint)

      // Création de l'utilisateur dans la base de données
      const user = await User.create({
        ...payload,
        profilImage: imageUrl,
        geoLocationPoint,
      })

      // On enregistre l'utilisateur sur Stream
      await streamClient.upsertUser({
        id: user.id.toString(),
        name: user.lastname,
        firstname: user.firstname,
        image: user.profilImage,
      })

      // Générer un token pour l'utilisateur sur Stream
      const streamToken = streamClient.createToken(user.id.toString())

      // Réponse au client
      return response.status(201).json({ message: 'User created', streamToken: streamToken })
    } catch (error) {
      console.error('Failed to process registration:', error)
      return response.status(500).json({
        error: error.message || 'Unknown error',
      })
    }
  }

  // Login
  async handleLogin({ request, response }: HttpContext) {
    try {
      // Récupération et validation des données de la requête avec le validateur de connexion
      const { email, password } = await request.validateUsing(loginUserValidator)

      let user
      try {
        // Vérification des informations d'identification de l'utilisateur + récupération de l'utilisateur si valide
        user = await User.verifyCredentials(email, password)
      } catch (error) {
        if (error.code === 'E_INVALID_CREDENTIALS') {
          return response.badRequest({ error: 'Email ou mot de passe incorrect' })
        }
        throw error // Relancer l'erreur si ce n'est pas une erreur d'identifiants invalides
      }

      // Création d'un token d'accès pour les utilisateurs authentifiés
      const token = await User.accessTokens.create(user)

      // On récupère le token stream de l'utilisateur
      const streamToken = streamClient.createToken(user.id.toString())

      // Réponse avec le token et les données utilisateur sérialisés
      return response.ok({
        token: token,
        ...user.serialize(),
        streamToken,
        streamApiKey: process.env.STREAM_API_KEY,
      })
    } catch (error) {
      // Réponse en cas d'erreur
      console.error('Login Error:', error)

      // Si l'erreur est une instance de ValidationException, renvoyer des messages d'erreur détaillés
      if (error.messages) {
        return response.badRequest({ error: error.messages })
      }

      // Autres erreurs
      return response.badRequest({ error: "Une erreur s'est produite lors de la connexion." })
    }
  }

  async getUserProfile({ auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      return response.ok(user.serialize())
    } catch (error) {
      console.error('Profile Retrieval Error:', error)
      return response.unauthorized({ error: 'User not authenticated' })
    }
  }
  async checkEmail({ request, response }: HttpContext) {
    const emailUserToCheck = request.input('email')
    console.log('Email to check:', emailUserToCheck)

    if (!emailUserToCheck) {
      return response.badRequest({ error: 'Votre email est obligatoire' })
    }

    try {
      const emailUserInDatabase = await User.findBy('email', emailUserToCheck)
      if (emailUserInDatabase) {
        return response.ok({ exists: true })
      } else {
        return response.ok({ exists: false })
      }
    } catch (error) {
      console.error('Email check error:', error)
      return response.internalServerError({ error: 'Failed to check email' })
    }
  }

  // Update
  async handleEditAccount({ auth, request, response }: HttpContext) {
    const bucketName = env.get('AWS_BUCKET_NAME')

    if (!bucketName) {
      return response.status(500).json({
        error: 'AWS_BUCKET_NAME is not defined in environment variables.',
      })
    }

    try {
      // Récupération de l'utilisateur authentifié (grâce à auth)
      const user = await auth.getUserOrFail()
      // Récupération et validation des données de la requête avec le validateur de modification
      const userData = await request.validateUsing(updateUserValidator)
      // Initialise la variable imageUrl avec la valeur actuelle de la miniature de l'utilisateur
      let imageUrl = user.profilImage

      // Vérifie si une nouvelle miniature a été fournie dans les données de la requête
      if (userData.profilImage) {
        // Récupère la miniature des données de la requête
        const profilImage = userData.profilImage
        // Génère un nom de fichier unique pour la miniature
        const filename = `${cuid()}_${Date.now()}.${profilImage.extname}`
        // Détermine le chemin temporaire où la miniature sera stockée
        const tempFilePath = `public/users/${filename}`
        // Déplace la miniature téléchargée vers le répertoire public/users avec le nom de fichier généré
        await profilImage.move(app.makePath('public/users'), { name: filename })
        // Télécharge la miniature vers AWS S3 et récupère l'URL de l'image
        imageUrl = await uploadImageToS3(tempFilePath, bucketName, filename)
        // Supprime le fichier temporaire après l'upload vers S3
        await unlink(tempFilePath)
      }
      // Fusionne les données validées avec l'utilisateur actuel et met à jour l'URL de la miniature
      user.merge({ ...userData, profilImage: imageUrl })
      // Enregistre les modifications apportées à l'utilisateur dans la base de données
      await user.save()

      return response.ok({
        message: 'User profile updated successfully',
        data: user,
      })
    } catch (error) {
      console.error('Edit Account Error:', error)
      return response.status(500).json({
        error: `Failed to update profile: ${error.message}`,
      })
    }
  }

  // Logout
  async handleLogout({ auth, response }: HttpContext) {
    try {
      // Récupération de l'utilisateur authentifié (grâce à auth)
      const user = auth.getUserOrFail()

      // Récupération du token de l'utilisateur
      const token = auth.user?.currentAccessToken.identifier

      // Si le token n'existe pas, on renvoie une erreur
      if (!token) {
        return response.badRequest({ message: 'Logout failed' })
      }

      // On supprime le token de l'user
      await User.accessTokens.delete(user, token)

      return response.ok({ message: 'Logged out' })
    } catch (error) {
      console.error('Logout Error:', error)
      return response.unauthorized({ error: 'Failed to logout' })
    }
  }

  // Delete
  async handleDeleteAccount({ auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      await user.delete()
      return response.ok({ message: 'User deleted successfully' })
    } catch (error) {
      console.error('Failed to delete account:', error)

      return response.internalServerError({
        message: 'Failed to delete account',
      })
    }
  }
}
