import vine from '@vinejs/vine'

export const storeSportValidator = vine.compile(
  vine.object({
    user_id: vine.number().positive(),
    session_id: vine.number().positive(),
    is_admin: vine.boolean(),
    is_accepted: vine.boolean(),
  })
)

export const joinSportSessionValidator = vine.compile(
  vine.object({
    sessionId: vine.number().positive(),
  })
)

export const acceptNewMemberValidator = vine.compile(
  vine.object({
    SessionMemberId: vine.number().positive(),
  })
)
export const leaveSessionValidator = vine.compile(
  vine.object({
    sessionId: vine.number().positive(),
  })
)
