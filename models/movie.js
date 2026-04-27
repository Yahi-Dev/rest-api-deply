import movies from "../movies.json" with { type: "json" };
import { randomUUID } from "node:crypto";

export class MovieModel {
  static getAllMovies = async ({ genre }) => {
    if (genre) {
      return movies.filter((movie) =>
        movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase()),
      );
    }
    return movies;
  };

  static getMovieById = async (id) => {
    if (id) {
      return movies.find((movie) => movie.id === id);
    }
    return null;
  };

  static createMovie = async (movieData) => {
    if (movieData) {
      const newMovie = {
        id: crypto.randomUUID(),
        ...movieData,
      };
      movies.push(newMovie);
      return newMovie;

      const movieCreated = movies.find((m) => m.id === newMovie.id);
      if (movieCreated) {
        return newMovie;
      } else {
        return null;
      }
    }
    return null;
  };

  static updateMovie = async (id, movieData) => {
    if (id && movieData) {
      const movieIndex = movies.findIndex((movie) => movie.id === id);
      if (movieIndex !== -1) {
        movies[movieIndex] = { ...movies[movieIndex], ...movieData };
        return movies[movieIndex];
      } else {
        return null;
      }
    }
    return null;
  };

  static deleteMovie = async (id) => {
    if (id) {
      const movieIndex = movies.findIndex((movie) => movie.id === id);
      if (movieIndex !== -1) {
        const deletedMovie = movies[movieIndex];
        movies.splice(movieIndex, 1);
        return deletedMovie;
      } else {
        return null;
      }
    }
    return null;
  };
}
