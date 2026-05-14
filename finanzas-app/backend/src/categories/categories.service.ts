import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  findAll(userId: number): Promise<Category[]> {
    return this.categoriesRepository.find({ where: { userId }, order: { name: 'ASC' } });
  }

  async create(userId: number, name: string, color?: string): Promise<Category> {
    const category = this.categoriesRepository.create({ userId, name, color: color || '#00b894' });
    return this.categoriesRepository.save(category);
  }

  async remove(id: number, userId: number): Promise<void> {
    const category = await this.categoriesRepository.findOne({ where: { id, userId } });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    await this.categoriesRepository.remove(category);
  }
}
