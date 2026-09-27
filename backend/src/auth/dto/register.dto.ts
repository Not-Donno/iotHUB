import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity.js';

/**
 * Self-service signup may only ever produce these two roles. `admin` is
 * deliberately absent: it is granted by the seed script, never by a request
 * body, so nobody can promote themselves over the public endpoint.
 */
export const SELF_SERVICE_ROLES = [UserRole.CUSTOMER, UserRole.VENDOR] as const;

export type SelfServiceRole = (typeof SELF_SERVICE_ROLES)[number];

export class RegisterDto {
  @IsEmail()
  email: string;

  // bcrypt only reads the first 72 bytes of a password and silently discards
  // the rest, so reject anything longer instead of pretending it is honoured
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @IsOptional()
  @IsIn(SELF_SERVICE_ROLES)
  role?: SelfServiceRole;
}
