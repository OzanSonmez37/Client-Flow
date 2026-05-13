import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto, UpdateClientDto } from './client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async findAll(search?: string) {
    const qb = this.clientRepository
      .createQueryBuilder('client')
      .loadRelationCountAndMap('client.projectCount', 'client.projects');

    if (search) {
      qb.where('client.name ILIKE :search OR client.email ILIKE :search OR client.industry ILIKE :search', {
        search: `%${search}%`,
      });
    }

    return qb.orderBy('client.createdAt', 'DESC').getMany();
  }

  async findOne(id: string) {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['projects'],
    });
    if (!client) throw new NotFoundException(`Client ${id} not found`);
    return client;
  }

  async create(dto: CreateClientDto) {
    const client = this.clientRepository.create(dto);
    return this.clientRepository.save(client);
  }

  async update(id: string, dto: UpdateClientDto) {
    const client = await this.findOne(id);
    Object.assign(client, dto);
    return this.clientRepository.save(client);
  }

  async remove(id: string) {
    const client = await this.findOne(id);
    await this.clientRepository.remove(client);
    return { message: 'Client deleted successfully' };
  }
}
