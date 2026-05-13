import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './user.entity';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) throw new ForbiddenException('Account is deactivated');

    return this.generateTokenResponse(user);
  }

  async register(dto: RegisterDto, requestingUser: User) {
    if (requestingUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can register new users');
    }

    const exists = await this.userRepository.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = this.userRepository.create({ ...dto, password: hashed });
    await this.userRepository.save(user);

    return this.generateTokenResponse(user);
  }

  async getMe(userId: string) {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async getUsers() {
    return this.userRepository.find({ select: ['id', 'email', 'name', 'role', 'isActive', 'createdAt'] });
  }

  private generateTokenResponse(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
