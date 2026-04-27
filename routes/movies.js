import { Router } from "express";
import { MovieController } from "../controllers/movies.js";

export const createMoviesRouter = ({ movieModel }) => {
  const moviesRouter = Router();

  const movieController = new MovieController({ movieModel });

  moviesRouter.get("/", movieController.getAllMovies);
  moviesRouter.post("/", movieController.createMovie);

  moviesRouter.get("/:id", movieController.getMovieById);
  moviesRouter.patch("/:id", movieController.updateMovie);
  moviesRouter.delete("/:id", movieController.deleteMovie);

  return moviesRouter;
};
