import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../projects/project.entity';
import { Client } from '../clients/client.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
  ) {}

  async getStats() {
    const totalClients = await this.clientRepo.count();
    const totalProjects = await this.projectRepo.count();
    const activeProjects = await this.projectRepo.count({
      where: { status: ProjectStatus.DEVELOPMENT },
    });

    const statusDistribution = await this.projectRepo
      .createQueryBuilder('p')
      .select('p.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('p.status')
      .getRawMany();

    const totalBudget = await this.projectRepo
      .createQueryBuilder('p')
      .select('SUM(p.budget)', 'total')
      .getRawOne();

    const recentProjects = await this.projectRepo.find({
      relations: ['client'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      totalClients,
      totalProjects,
      activeProjects,
      totalBudget: parseFloat(totalBudget?.total || '0'),
      statusDistribution: statusDistribution.map((s) => ({
        status: s.status,
        count: parseInt(s.count),
      })),
      recentProjects,
    };
  }

  async getTimeline() {
    const months = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;

      const budgetResult = await this.projectRepo
        .createQueryBuilder('p')
        .select('SUM(p.budget)', 'budget')
        .where('EXTRACT(YEAR FROM p.createdAt) = :year', { year })
        .andWhere('EXTRACT(MONTH FROM p.createdAt) = :month', { month })
        .getRawOne();

      const projectCount = await this.projectRepo
        .createQueryBuilder('p')
        .where('EXTRACT(YEAR FROM p.createdAt) = :year', { year })
        .andWhere('EXTRACT(MONTH FROM p.createdAt) = :month', { month })
        .getCount();

      months.push({
        month: `${year}-${String(month).padStart(2, '0')}`,
        label: d.toLocaleString('tr-TR', { month: 'short', year: 'numeric' }),
        budget: parseFloat(budgetResult?.budget || '0'),
        projects: projectCount,
      });
    }

    return months;
  }
}
