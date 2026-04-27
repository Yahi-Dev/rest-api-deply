import cors from 'cors'


const ACEPTED_ORIGINS = ['http://127.0.0.1:5501']

export const corsMiddleware = (req, res, next) => {
    const origin = req.headers.origin
    if (ACEPTED_ORIGINS.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin)
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    if (req.method === 'OPTIONS') return res.sendStatus(200)
    next()
}