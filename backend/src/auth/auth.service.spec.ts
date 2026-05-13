import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User, UserRole } from './user.entity';

const mockUser: User = {
  id: 'uuid-1',
  email: 'admin@test.com',
  name: 'Admin User',
  password: bcrypt.hashSync('password123', 10),
  role: UserRole.ADMIN,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return token on valid credentials', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.login({ email: 'admin@test.com', password: 'password123' });
      expect(result).toHaveProperty('access_token');
      expect(result.user.email).toBe('admin@test.com');
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      await expect(service.login({ email: 'admin@test.com', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.login({ email: 'notfound@test.com', password: 'pass' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should throw ConflictException if email exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      await expect(
        service.register({ email: 'admin@test.com', name: 'X', password: 'pass123', role: UserRole.MANAGER }, mockUser),
      ).rejects.toThrow(ConflictException);
    });

    it('should create new user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({ ...mockUser, email: 'new@test.com' });
      mockUserRepository.save.mockResolvedValue({ ...mockUser, email: 'new@test.com' });

      const result = await service.register(
        { email: 'new@test.com', name: 'New User', password: 'pass123', role: UserRole.MANAGER },
        mockUser,
      );
      expect(result).toHaveProperty('access_token');
    });
  });
});
