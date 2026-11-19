import { Router } from 'express';
import beanController from '../controllers/beanController.js';

const router = Router();

router.get('/', beanController.getAll);
router.get('/:id', beanController.getById);
router.post('/', beanController.create);
router.put('/:id', beanController.update);

router.patch('/:id/archive', beanController.archive);
router.patch('/:id/restore', beanController.restore);

router.delete('/:id', beanController.delete);

export default router;