import vine from '@vinejs/vine'

export const storeSportValidator = vine.compile(
  vine.object({
    sport_ids: vine.array(vine.number().positive().withoutDecimals()).minLength(1).maxLength(5),
  })
)

export const updateSportValidator = vine.compile(
  vine.object({
    currentSportId: vine.number().positive(),
    newSportId: vine.number().positive(),
  })
)

export const deleteSportValidator = vine.compile(
  vine.object({
    sport_id: vine.number().positive(),
  })
)
