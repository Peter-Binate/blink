import vine from '@vinejs/vine'
import Status from '../enums/sport_session.js'
import Level from '../enums/difficulty_level.js'

export const storeSportSessionValidator = vine.compile(
  vine.object({
    // startDate: vine
    //   .date({
    //     formats: ['YYYY/DD/MM', 'x'],
    //   })
    //   .after('yesterday'),
    startDate: vine.date().optional(),
    sportId: vine.number().positive(),
    maxParticipants: vine.number().withoutDecimals().positive(),
    onlyBlindOrVisuallyImpaired: vine.boolean().optional(),
    difficultyLevel: vine
      .enum([Level.AUCUN, Level.DEBUTANT, Level.INTERMEDIAIRE, Level.HAUTNIVEAU])
      .optional(),
    description: vine.string().escape().trim().optional(),
    location: vine.string(),
    latitude: vine.number().min(-90).max(90),
    longitude: vine.number().min(-180).max(180),
    isPrivate: vine.boolean().optional(),
    status: vine.enum([Status.PENDING, Status.FINISH, Status.CANCELED]).optional(),
  })
)

export const updateSportSessionValidator = vine.compile(
  vine.object({
    sessionId: vine.number().positive().optional(),
    startDate: vine.date().optional(),
    sportId: vine.number().positive().optional(),
    maxParticipants: vine.number().withoutDecimals().positive().optional(),
    onlyBlindOrVisuallyImpaired: vine.boolean().optional(),
    difficultyLevel: vine
      .enum([Level.AUCUN, Level.DEBUTANT, Level.INTERMEDIAIRE, Level.HAUTNIVEAU])
      .optional(),
    description: vine.string().escape().trim().optional(),
    location: vine.string().optional(),
    latitude: vine.number().min(-90).max(90),
    longitude: vine.number().min(-180).max(180),
  })
)

export const filterSessionsValidator = vine.compile(
  vine.object({
    //sportIds: vine.number().positive().withoutDecimals().optional(),
    // distanceFilter: vine.number(), // assuming distance is in km, max 50 km for filtering
    sportIdGroup: vine.array(vine.number().positive().withoutDecimals()).minLength(1),
    latitude: vine.number().min(-90).max(90),
    longitude: vine.number().min(-180).max(180),
    distanceFilter: vine.number(),
  })
)
