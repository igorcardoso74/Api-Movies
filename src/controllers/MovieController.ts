import { Request, Response, NextFunction } from "express";
import IMovie from "../interfaces/MovieInterface.js";
import MovieService from "../services/MovieService.js";
import ApiError from "../utils/ApiError.js";
import AuthService from "../services/AuthService.js";
import { IUser } from "../models/UserModel.js";
import MovieModel from "../models/MovieModel.js";
import { IMovieMongoose } from "../models/MovieModel.js";
import FileService from "../services/FileService.js";
import RatingModel from "../models/ratingModel.js";


class MovieController{
    async create(req: Request, res: Response, next: NextFunction){
      
      if (!AuthService.isAdmin(req.user as IUser)) {
        return res.status(401).json({ error: "Not authorized" });
      }
        try{
        const {title, releaseDate, trailerLink, genres} = req.body;

        const image = req.files?.image;

        let posterUrl = 'no-image.jpg';

        if (image) {
          posterUrl = await FileService.save(image);
        }

        const newMovie = {
            title,
            releaseDate,
            trailerLink,
            posterUrl: posterUrl,
            genres
        } as IMovie;
        const savedMovie = await MovieService.createMovie(newMovie);
        
        res.status(201).json(savedMovie);
        } catch (error){
            next(error)
        }
    }
    async getOne(req: Request, res: Response, next: NextFunction){
        try{
            const {id} = req.params;
    
            const foundMovie = await MovieService.getMovieById(id);

            if (!foundMovie){
                throw ApiError.NotFoundError(`Movie not found!`)
            }

            const fullPosterUrl = `${req.protocol}://${req.get('host')}/${foundMovie?.posterUrl}`;

      const movieWithFullImageUrl = {
        ...foundMovie?.toJSON(),
        posterUrl: fullPosterUrl,
      }
            res.status(201).json(movieWithFullImageUrl);
            } catch (error){
                next(error);
            }
    }
    async getAll(req: Request, res: Response, next: NextFunction) {
      
        try {
          const page = parseInt(req.query.page as string) || 1;
          const limit = parseInt(req.query.limit as string) || 10;
          const sortBy = req.query.sortBy as string || 'releaseDate';
          const sortOrder = req.query.sortOrder as string || 'desc';
          const filtersQuery = req.query.filters as string | undefined;
    
          let filters: any = {};
    
          if (filtersQuery) {
            try {
              filters = JSON.parse(decodeURIComponent(filtersQuery));
            } catch (error) {
              return next(ApiError.BadRequestError('Invalid filters JSON'))
            }
          }
          const movies =
            await MovieService.getAllMovies(page, limit, sortBy, sortOrder, filters)
          res.json(movies)
        } catch (error) {
          next(error)
        }
    }
    async delete(req: Request, res: Response) {
      if (!AuthService.isAdmin(req.user as IUser)) {
        return res.status(401).json({ error: "Not authorized" });
      }
      try {
        const movieID = req.params.id;
  
        if (!AuthService.isAdmin(req.user as IUser)) {
          return res.status(401).json({ error: "Not authorized" });
        }
  
        const deletedMovie: IMovieMongoose | null = await MovieModel.findByIdAndDelete(movieID);
  
        if (!deletedMovie) {
          return res.status(404).json({ error: 'Movie not found' });
        }
  
        res.json(deletedMovie);
      } catch (err) {
        console.log(err);
        res.status(500).send({ errorMessage: 'Failed to delete movie', error: err });
      }
    }
    async update(req: Request, res: Response) {
        
        if (!AuthService.isAdmin(req.user as IUser)) {
          return res.status(401).json({ error: "Not authorized" });
        }
        try {
          const movieId = req.params.id;
    
          const { title, releaseDate, trailerLink, genres } = req.body;
          
          const image = req.files?.image;

          let posterUrl = 'no-image.jpg';
    
          let existingMovie: IMovieMongoose | null = await MovieModel.findById(movieId);
    
          if (!existingMovie) {
            res.status(404).json({ message: "Movie not found" });
          }

          if (existingMovie) {
            if (existingMovie.posterUrl && existingMovie.posterUrl !== 'no-image.jpg') {
              await FileService.delete(existingMovie.posterUrl);
            }
    
            if (image) {
              posterUrl = await FileService.save(image);
            }
    
          if (existingMovie) {
            existingMovie.title = title || existingMovie.title;
            existingMovie.releaseDate = releaseDate || existingMovie.releaseDate;
            existingMovie.trailerLink = trailerLink || existingMovie.trailerLink;
            existingMovie.posterUrl = posterUrl || existingMovie.posterUrl;
            existingMovie.genres = genres || existingMovie.genres;
    
            const updatedMovie = await existingMovie.save();
            res.json(updatedMovie);
          }
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({ errorMessage: 'Failed to update movie', error: err });
    }
    }
async createRating(req: Request, res: Response) {
  try {
    const { userId, movieId, rating, comment } = req.body;

    
    const existingRating = await RatingModel.findOne({ userId, movieId });
    if (existingRating) {
      return res.status(400).json({ error: "You have already rated this movie!" });
    }
    const newRating = new RatingModel({
      userId,
      movieId,
      rating,
      comment,
    });
    await newRating.save();
    return res.status(201).json({ message: "Movie rating added successfully!" });
  } catch (error) {
    return res.status(500).json({ error: "An error occurred while adding the movie rating!" });
  }
}
}

export default new MovieController;