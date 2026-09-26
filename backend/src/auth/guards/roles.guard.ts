import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import type { SafeUser } from '../auth.service.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    // no @Roles() on this route, so any authenticated caller is fine
    if (!required?.length) return true;

    const user = context.switchToHttp().getRequest().user as SafeUser | undefined;
    if (!user || !required.includes(user.role)) {
      throw new ForbiddenException(
        `This route requires role: ${required.join(' or ')}`,
      );
    }
    return true;
  }
}
