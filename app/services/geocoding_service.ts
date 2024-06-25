import axios from 'axios'
import env from '#start/env'

export default class GeocodingService {
  // Déclaration d'une variable privée pour stocker la clé API
  private apiKey: string | null

  constructor() {
    const apiKey = env.get('GOOGLE_MAPS_API_KEY')

    if (!apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY is not defined in environment variables')
    }

    this.apiKey = apiKey
  }
  // Méthode asynchrone pour géocoder une adresse
  async geocode(address: string) {
    try {
      // Effectuer une requête GET à l'API de géocodage de Google Maps
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        // Paramètres de la requête : l'adresse et la clé API
        params: {
          address,
          key: this.apiKey,
        },
      })

      // Extraction des résultats de la réponse de l'API
      const { results } = response.data

      // On vérifie si des résultats ont été trouvés
      if (results.length > 0) {
        // Extraction des coordonnées (latitude et longitude) du premier résultat
        const { latitude, longitude } = results[0].geometry.location
        // Affichage des coordonnées dans la console
        console.log(`Geocoded address: ${address}, Latitude: ${latitude}, Longitude: ${longitude}`)
        // Retourner un objet contenant la latitude et la longitude
        return { latitude: latitude, longitude: longitude }
      }

      // Si aucun résultat n'est trouvé, lancer une erreur
      throw new Error('Address not found')
    } catch (error) {
      // En cas d'erreur, afficher l'erreur dans la console
      console.error('Error geocoding address:', error)
      // Lancer une erreur pour indiquer l'échec du géocodage
      throw new Error('Failed to geocode address')
    }
  }
}
