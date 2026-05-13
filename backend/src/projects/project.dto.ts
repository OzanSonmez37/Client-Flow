import {
  IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber,
  IsOptional, IsString, IsUUID, Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ProjectStatus } from './project.entity';

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ProjectStatus)
  status: ProjectStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  teamMembers?: string[];

  @IsOptional()
  @IsString()
  priority?: string;

  @IsUUID()
  clientId: string;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
