import { randomUUID } from "node:crypto";
import { Router } from "express";
import movies from "../movies.json" with { type: "json" };
import {
  movieSchema,
  validateMovie,
  validatePartialMovie,
} from "../schemas/movies.js";
import { MovieModel } from "../models/movie.js";


export const moviesRouter = Router();


moviesRouter.get("/", async (req, res) => {
  const { genre } = req.query;
  const movies = await MovieModel.getAllMovies({ genre });
  res.json(movies);
});

moviesRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  const movie = await MovieModel.getMovieById(id);
  if (!movie) {
    return res.status(404).json({ message: "movie not found" });
  }
  res.json(movie);
});

moviesRouter.post("/", async (req, res) => {
  const movie = validateMovie(req.body);

  if (movie.error) {
    return res
      .status(422)
      .json({
        message: "invalid movie data",
        errors: JSON.stringify(movie.error.errors),
      });
  }

  const newMovie = await MovieModel.createMovie(movie.data);

  if (newMovie) {
    res.status(201).json({ message: "movie created" });
  } else {
    res.status(500).json({ message: "error creating movie" });
  }
});

moviesRouter.patch("/:id", async (req, res) => {
  const { id } = req.params;

  const result = validatePartialMovie(req.body);

  if (result.error) {
    return res
      .status(422)
      .json({
        message: "invalid movie data",
        errors: JSON.stringify(result.error.errors),
      });
  }

  const updatedMovie = await MovieModel.updateMovie(id, result.data);

  if (!updatedMovie) {
    return res.status(404).json({ message: "movie not found" });
  }

  res.json({ message: "movie updated" });
});

moviesRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const deletedMovie = await MovieModel.deleteMovie(id);

  if (!deletedMovie) {
    return res.status(404).json({ message: "movie not found" });
  }

  res.json({ message: "movie deleted" });
});
