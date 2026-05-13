import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from './project.entity';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async findAll(status?: ProjectStatus, clientId?: string, search?: string) {
    const qb = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.client', 'client');

    if (status) qb.andWhere('project.status = :status', { status });
    if (clientId) qb.andWhere('project.clientId = :clientId', { clientId });
    if (search) {
      qb.andWhere('project.title ILIKE :search OR project.description ILIKE :search', {
        search: `%${search}%`,
      });
    }

    return qb.orderBy('project.createdAt', 'DESC').getMany();
  }

  async findOne(id: string) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['client'],
    });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async create(dto: CreateProjectDto) {
    const project = this.projectRepository.create(dto);
    return this.projectRepository.save(project);
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.findOne(id);
    Object.assign(project, dto);
    return this.projectRepository.save(project);
  }

  async remove(id: string) {
    const project = await this.findOne(id);
    await this.projectRepository.remove(project);
    return { message: 'Project deleted successfully' };
  }
}
