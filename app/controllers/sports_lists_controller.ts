import type { HttpContext } from '@adonisjs/core/http'
import Sport from '#models/sport'

export default class SportsListsController {
  /**
   * Display a list of resource
   */
  async index({ response }: HttpContext) {
    try {
      const sports = await Sport.all()
      return response.ok(sports)
    } catch (error) {
      console.error('Error fetching sports:', error)
      return response.internalServerError({ error: 'Failed to fetch sports' })
    }
  }
}
