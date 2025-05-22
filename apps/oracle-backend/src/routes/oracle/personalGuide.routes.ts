import { Router } from 'express';
import { authenticateToken } from '../../middleware/authenticateToken';
import { getGuideInfo, askPersonalOracle } from '../../controllers/personalGuide.controller';

const router = Router();

router.use(authenticateToken);

router.get('/info', getGuideInfo);
router.post('/ask', askPersonalOracle);

export default router;
