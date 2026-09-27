import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { SafeUser } from '../auth.service.js';

/**
 * Injects the caller resolved from the bearer token by JwtAuthGuard.
 * The entity is already stripped of `password_hash`.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SafeUser =>
    ctx.switchToHttp().getRequest().user,
);
