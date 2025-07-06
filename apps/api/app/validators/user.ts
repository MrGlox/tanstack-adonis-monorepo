import vine from '@vinejs/vine'

/**
 * Validates the user's creation action
 */
export const createUserValidator = vine.compile(
    vine.object({
        fullName: vine.string(),
        email: vine.string().email(),
        password: vine.string(),
    })
)

/**
 * Validates the user's login action
 */
export const loginValidator = vine.compile(
    vine.object({
        email: vine.string().email(),
        password: vine.string(),
    })
)

/**
 * Validates the user's list response
 */
export const userListResponse = vine.compile(
    vine.object({
        message: vine.string(),
    })
)