import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity.js';

export const ROLES_KEY = 'roles';

/**
 * Restrict a route to the given roles. Only takes effect when RolesGuard is
 * applied to the route (it is registered globally, so this is the default).
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
