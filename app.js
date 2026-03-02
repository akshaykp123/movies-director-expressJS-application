const express = require('express')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const path = require('path')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')
let db = null

const initializeDB = async () => {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  })
}

// Initialize DB before tests
initializeDB()

// API 1: Get all movie names
app.get('/movies/', async (req, res) => {
  const movies = await db.all(`SELECT movie_name AS movieName FROM movie;`)
  res.send(movies)
})

// API 2: Add a movie
app.post('/movies/', async (req, res) => {
  const {directorId, movieName, leadActor} = req.body
  await db.run(
    `INSERT INTO movie (director_id, movie_name, lead_actor) VALUES (?, ?, ?);`,
    [directorId, movieName, leadActor],
  )
  res.send('Movie Successfully Added')
})

// API 3: Get movie by ID
app.get('/movies/:movieId/', async (req, res) => {
  const {movieId} = req.params
  const movie = await db.get(
    `SELECT movie_id AS movieId, director_id AS directorId, movie_name AS movieName, lead_actor AS leadActor FROM movie WHERE movie_id = ?;`,
    [movieId],
  )
  res.send(movie)
})

// API 4: Update movie
app.put('/movies/:movieId/', async (req, res) => {
  const {movieId} = req.params
  const {directorId, movieName, leadActor} = req.body
  await db.run(
    `UPDATE movie SET director_id = ?, movie_name = ?, lead_actor = ? WHERE movie_id = ?;`,
    [directorId, movieName, leadActor, movieId],
  )
  res.send('Movie Details Updated')
})

// API 5: Delete movie
app.delete('/movies/:movieId/', async (req, res) => {
  const {movieId} = req.params
  await db.run(`DELETE FROM movie WHERE movie_id = ?;`, [movieId])
  res.send('Movie Removed')
})

// API 6: Get all directors
app.get('/directors/', async (req, res) => {
  const directors = await db.all(
    `SELECT director_id AS directorId, director_name AS directorName FROM director;`,
  )
  res.send(directors)
})

// API 7: Get movies by director
app.get('/directors/:directorId/movies/', async (req, res) => {
  const {directorId} = req.params
  const movies = await db.all(
    `SELECT movie_name AS movieName FROM movie WHERE director_id = ?;`,
    [directorId],
  )
  res.send(movies)
})

module.exports = app
