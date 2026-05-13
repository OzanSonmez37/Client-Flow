import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClientsService } from './clients.service';
import { Client } from './client.entity';

const mockClient: Client = {
  id: 'uuid-1',
  name: 'Acme Corp',
  email: 'contact@acme.com',
  phone: '+1234567890',
  industry: 'Technology',
  website: 'https://acme.com',
  notes: 'VIP client',
  isActive: true,
  projects: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockQb = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  loadRelationCountAndMap: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getMany: jest.fn().mockResolvedValue([mockClient]),
};

const mockRepo = {
  createQueryBuilder: jest.fn().mockReturnValue(mockQb),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('ClientsService', () => {
  let service: ClientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: getRepositoryToken(Client), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    jest.clearAllMocks();
    mockRepo.createQueryBuilder.mockReturnValue(mockQb);
  });

  it('should return all clients', async () => {
    const result = await service.findAll();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Acme Corp');
  });

  it('should find one client by id', async () => {
    mockRepo.findOne.mockResolvedValue(mockClient);
    const result = await service.findOne('uuid-1');
    expect(result.name).toBe('Acme Corp');
  });

  it('should throw NotFoundException for unknown id', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('unknown')).rejects.toThrow(NotFoundException);
  });

  it('should create a client', async () => {
    mockRepo.create.mockReturnValue(mockClient);
    mockRepo.save.mockResolvedValue(mockClient);
    const result = await service.create({ name: 'Acme Corp', industry: 'Technology' });
    expect(result.name).toBe('Acme Corp');
  });
});
