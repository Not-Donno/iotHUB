import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Opt a route out of the globally registered JwtAuthGuard.
 * Without this every route requires a valid bearer token.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
