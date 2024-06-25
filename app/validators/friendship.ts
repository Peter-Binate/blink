import vine from '@vinejs/vine'
import Status from '../enums/friendship.js'

export const storeSportValidator = vine.compile(
  vine.object({
    senderUserId: vine.number().positive(),
    receiverUserId: vine.number().positive(),
    status: vine.enum([Status.PENDING, Status.ACCEPTED]),
  })
)
