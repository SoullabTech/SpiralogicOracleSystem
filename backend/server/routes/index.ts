import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ message: 'Welcome to the API' });
});
router.use("/journal", journalRoutes)

export default router;