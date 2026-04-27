import { Router } from "express";
import { MovieController } from "../controllers/movies.js";

export const moviesRouter = Router();

moviesRouter.get("/", MovieController.getAllMovies);

moviesRouter.get("/:id", MovieController.getMovieById);

moviesRouter.post("/", MovieController.createMovie);

moviesRouter.patch("/:id", MovieController.updateMovie);

moviesRouter.delete("/:id", MovieController.deleteMovie);
 