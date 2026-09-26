import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity.js';
import { AuthService } from './auth.service.js';
// type-only: SafeUser is an alias, and emitDecoratorMetadata needs a value
// import for anything named in a decorated signature
import type { SafeUser } from './auth.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import { Roles } from './decorators/roles.decorator.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Self-service signup. Creates a customer or a vendor, never an admin. */
  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto): Promise<SafeUser> {
    return this.authService.register(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /** Proves the global guard resolved the caller from the bearer token. */
  @Get('me')
  me(@CurrentUser() user: SafeUser): SafeUser {
    return user;
  }

  /** Example role gate: only an admin token gets past this. */
  @Roles(UserRole.ADMIN)
  @Get('admins-only')
  adminsOnly(@CurrentUser() user: SafeUser) {
    return { message: 'admin access granted', caller: user.email };
  }
}
