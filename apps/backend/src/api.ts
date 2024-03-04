import express from 'express';
import {
  searchApplicant,
  searchApplicantSchema,
  searchAddress,
  searchAddressSchema,
  searchNearby,
  searchNearbySchema,
} from './handlers/search';
import { asyncHandler } from '@middleware/async-handler';

const router = express.Router();

router.get('/search/applicant', asyncHandler(searchApplicant, searchApplicantSchema));
router.get('/search/address', asyncHandler(searchAddress, searchAddressSchema));
router.get('/search/nearby', asyncHandler(searchNearby, searchNearbySchema));

export default router;
