import express from "express";
import MovieController from "../controllers/MovieController.js";

const router = express.Router();

router.get('/movies', MovieController.getAll);
router.get('/movies/:id', MovieController.getOne);
router.post('/movies', MovieController.create);
router.put('/movies/:id', MovieController.update);
router.delete('/movies/:id', MovieController.delete);

// Rate
router.post("/ratings", MovieController.createRating);

export default router;

