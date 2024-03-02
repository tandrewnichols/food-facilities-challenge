import { asyncHandler } from './async-handler';

export const healthCheck = asyncHandler(async () => ({
  ok: true,
  data: {}
}));
