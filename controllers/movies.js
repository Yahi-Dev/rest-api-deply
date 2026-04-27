// En controllers/movies.js
import { validateMovie, validatePartialMovie } from "../schemas/movies.js";

export class MovieController {

  constructor({movieModel}) {
    this.movieModel = movieModel;
  }

   getAllMovies = async (req, res) => {
    try {
      const { genre } = req.query;
      const movies = await this.movieModel.getAllMovies({ genre });
      res.json(movies);
    } catch (error) {
      console.error("Error in getAllMovies:", error); // 👈 Añade logging
      res.status(500).json({ message: "error fetching movies" });
    }
  }

   getMovieById = async (req, res) => {
    try {
      const { id } = req.params;
      // 👇 IMPORTANTE: Pasar como objeto { id }
      const movie = await this.movieModel.getMovieById({ id });
      if (!movie) {
        return res.status(404).json({ message: "movie not found" });
      }
      res.json(movie);
    } catch (error) {
      console.error("Error in getMovieById:", error); // 👈 Añade logging
      res.status(500).json({ message: "error fetching movie" });
    }
  }

   createMovie = async (req, res) => {
    try {
      const result = validateMovie(req.body); // 👈 Cambia 'movie' a 'result'

      if (result.error) {
        return res.status(422).json({
          message: "invalid movie data",
          errors: JSON.stringify(result.error.errors),
        });
      }

      // 👇 Pasar como { input: result.data }
      const newMovie = await this.movieModel.createMovie({ input: result.data });

      if (newMovie) {
        res.status(201).json(newMovie); // 👈 Devuelve la película creada
      } else {
        res.status(500).json({ message: "error creating movie" });
      }
    } catch (error) {
      console.error("Error in createMovie:", error);
      res.status(500).json({ message: "error creating movie" });
    }
  }

   updateMovie = async (req, res) => {
    try {
      const { id } = req.params;
      const result = validatePartialMovie(req.body);

      if (result.error) {
        return res.status(422).json({
          message: "invalid movie data",
          errors: JSON.stringify(result.error.errors),
        });
      }

      // 👇 Pasar como { id, input: result.data }
      const updatedMovie = await this.movieModel.updateMovie({
        id,
        input: result.data,
      });

      if (!updatedMovie) {
        return res.status(404).json({ message: "movie not found" });
      }

      res.json({ message: "movie updated" });
    } catch (error) {
      console.error("Error in updateMovie:", error);
      res.status(500).json({ message: "error updating movie" });
    }
  }

   deleteMovie = async (req, res) => {
    try {
      const { id } = req.params;
      // 👇 Pasar como { id }
      const deletedMovie = await this.movieModel.deleteMovie({ id });

      if (!deletedMovie) {
        return res.status(404).json({ message: "movie not found" });
      }

      res.json({ message: "movie deleted" });
    } catch (error) {
      console.error("Error in deleteMovie:", error);
      res.status(500).json({ message: "error deleting movie" });
    }
  }

}
