import express, { json } from 'express'
import movies from './movies.json' with { type: 'json' }
import { randomUUID } from 'node:crypto'
import { title } from 'node:process'
import z from 'zod'
import { movieSchema, validateMovie, validatePartialMovie } from './schemas/movies.js'

const app = express()

const ACEPTED_ORIGINS = ['http://127.0.0.1:5501']

app.disable('x-powered-by')
app.use(json())
app.use((req, res, next) => {
    const origin = req.headers.origin
    if (ACEPTED_ORIGINS.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin)
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    if (req.method === 'OPTIONS') return res.sendStatus(200)
    next()
})


app.get('/', (req, res) => {
    res.json({message: 'hola mundo'})
})


//GET /movies?genre=terror
app.get('/movies', (req, res) => {
    const {genre} = req.query
    if (genre) {
        const filteredMovies = movies.filter(movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()))
        return res.json(filteredMovies)
    }
    res.json(movies)
})


//GET /movies/:id
app.get('/movies/:id', (req, res) => {
    const {id} = req.params
    const movie = movies.find(movie => movie.id === id)
    if (!movie) {
        return res.status(404).json({message: 'movie not found'})
    }
    res.json(movie)
})


//POST /movies
app.post('/movies', (req, res) => {
    const movie = validateMovie(req.body)

    if (movie.error) {
        return res.status(422)
        .json({message: 'invalid movie data', errors: JSON.stringify(movie.error.errors)})
    }

    const newMovie = {
        id: randomUUID(),
        ...movie.data
    }
    
    movies.push(newMovie)

    const movieCreated = movies.find(m => m.id === newMovie.id)
    if (movieCreated) {
        res.status(201).json({message: 'movie created'})
    } else {
        res.status(500).json({message: 'error creating movie'})
    }
})


//PATCH /movies/:id
app.patch('/movies/:id', (req, res) => {
    const {id} = req.params

    const result = validatePartialMovie(req.body)

    if (result.error) {
        return res.status(422)
        .json({message: 'invalid movie data', errors: JSON.stringify(result.error.errors)})
    }

    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({message: 'movie not found'})
    }

    movies[movieIndex] = {
        ...movies[movieIndex],
        ...result.data
    }

    res.json({message: 'movie updated'})
})

//DELETE /movies/:id
app.delete('/movies/:id', (req, res) => {
    const {id} = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({message: 'movie not found'})
    }

    movies.splice(movieIndex, 1)
    res.json({message: 'movie deleted'})
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`)
})

