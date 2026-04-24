import { z } from 'zod'

export const movieSchema = z.object({
    title: z.string({
        invalid_type_error: 'title must be a string',
        required_error: 'title is required'
    }),

    genre: z.array(z.enum(['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance'], {
        invalid_type_error: 'genre must be an array of strings',
        required_error: 'genre is required'
    })),

    year: z.number().int()
    .min(1888, 'year must be greater than or equal to 1888')
    .max(new Date().getFullYear(), `year must be less than or equal to ${new Date().getFullYear()}`),

    director: z.string().optional(),

    duration: z.number().int().positive('duration must be a positive integer').optional(),

    rate: z.number()
    .min(0, 'rate must be greater than or equal to 0')
    .max(10, 'rate must be less than or equal to 10').optional(),

    poster: z.string().url('poster must be a valid URL').optional()
})

export function validateMovie(movie) {
    try {
       return movieSchema.safeParse(movie)
    } catch (error) {
        return { valid: false, errors: error.errors }
    }
}

export function validatePartialMovie(params) {
    const partialSchema = movieSchema.partial()
    try {
        return partialSchema.safeParse(params)
    } catch (error) {
        return { valid: false, errors: error.errors }
    }
}