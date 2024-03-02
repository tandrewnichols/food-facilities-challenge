import express from 'express';
import { search } from './handlers/search';

const router = express.Router();

router.get('/search', search);

export default router;
