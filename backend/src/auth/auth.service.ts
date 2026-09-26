import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

const SALT_ROUNDS = 12;

/** A User as it is safe to hand back over HTTP. */
export type SafeUser = Omit<User, 'password_hash'>;

export interface JwtPayload {
  /** user id */
  sub: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<SafeUser> {
    const email = dto.email.trim().toLowerCase();
    if (await this.users.findOneBy({ email })) {
      throw new ConflictException('Email is already registered');
    }

    const user = this.users.create({
      email,
      password_hash: await hash(dto.password, SALT_ROUNDS),
      // dto.role is already narrowed to customer|vendor by @IsIn, and the
      // default covers a body that omitted it
      role: dto.role ?? UserRole.CUSTOMER,
    });

    return this.sanitize(await this.users.save(user));
  }

  async login(dto: LoginDto): Promise<{ access_token: string; user: SafeUser }> {
    const user = await this.users.findOneBy({
      email: dto.email.trim().toLowerCase(),
    });

    // one message for both branches so this endpoint cannot be used to
    // discover which email addresses are registered
    if (!user || !(await compare(dto.password, user.password_hash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!user.is_active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return {
      access_token: await this.jwt.signAsync({
        sub: user.id,
        email: user.email,
        role: user.role,
      } satisfies JwtPayload),
      user: this.sanitize(user),
    };
  }

  /**
   * Verifies the signature and then re-reads the account, so a user who was
   * deleted or deactivated loses access immediately rather than at token expiry.
   */
  async verifyToken(token: string): Promise<SafeUser> {
    const payload = await this.jwt.verifyAsync<JwtPayload>(token);
    const user = await this.users.findOneBy({ id: payload.sub });

    if (!user || !user.is_active) {
      throw new UnauthorizedException('Account is no longer active');
    }
    return this.sanitize(user);
  }

  private sanitize(user: User): SafeUser {
    const { password_hash: _ignored, ...rest } = user;
    return rest;
  }
}
