import { MovieModel } from "../models/local-file-system/movie.js";
// import { MovieModel } from "../models/database/movie.js";
import { validateMovie, validatePartialMovie } from "../schemas/movies.js";

export class MovieController {

    static async getAllMovies(req, res) {
      try {
        const { genre } = req.query;
        const movies = await MovieModel.getAllMovies({ genre });
        res.json(movies);
      } catch (error) {
        res.status(500).json({ message: "error fetching movies" });
      }
    }

    static async getMovieById(req, res) {
      try {
        const { id } = req.params;
        const movie = await MovieModel.getMovieById(id);
        if (!movie) {
          return res.status(404).json({ message: "movie not found" });
        }
        res.json(movie);
      } catch (error) {
        res.status(500).json({ message: "error fetching movie" });
      }
    }

    static async createMovie(req, res) {
      try {
        const movie = validateMovie(req.body);

        if (movie.error) {
          return res.status(422).json({
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
      } catch (error) {
        res.status(500).json({ message: "error creating movie" });
      }
    }

    static async updateMovie(req, res) {
      try {
        const { id } = req.params;

        const result = validatePartialMovie(req.body);

        if (result.error) {
          return res.status(422).json({
            message: "invalid movie data",
            errors: JSON.stringify(result.error.errors),
          });
        }

        const updatedMovie = await MovieModel.updateMovie(id, result.data);

        if (!updatedMovie) {
          return res.status(404).json({ message: "movie not found" });
        }

        res.json({ message: "movie updated" });
      } catch (error) {
        res.status(500).json({ message: "error updating movie" });
      }
    }

    static async deleteMovie(req, res) {
      try {
        const { id } = req.params;
        const deletedMovie = await MovieModel.deleteMovie(id);

        if (!deletedMovie) {
          return res.status(404).json({ message: "movie not found" });
        }

        res.json({ message: "movie deleted" });
      } catch (error) {
        res.status(500).json({ message: "error deleting movie" });
      }
    }
}
