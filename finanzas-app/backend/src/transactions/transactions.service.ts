import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private usersService: UsersService,
  ) {}

  findAll(userId: number): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    userId: number,
    amount: number,
    type: string,
    description?: string,
    categoryId?: number,
  ): Promise<Transaction> {
    const transaction = this.transactionsRepository.create({
      userId,
      amount,
      type,
      description,
      categoryId: categoryId || null,
    });
    return this.transactionsRepository.save(transaction);
  }

  async remove(id: number, userId: number): Promise<void> {
    const transaction = await this.transactionsRepository.findOne({ where: { id, userId } });
    if (!transaction) throw new NotFoundException('Transacción no encontrada');
    await this.transactionsRepository.remove(transaction);
  }

  async getSummary(userId: number) {
    const user = await this.usersService.findById(userId);
    const transactions = await this.findAll(userId);

    let totalIncome = 0;
    let totalExpenses = 0;

    for (const t of transactions) {
      const amount = parseFloat(t.amount as any);
      if (t.type === 'income') totalIncome += amount;
      else totalExpenses += amount;
    }

    const currentBalance = parseFloat(user.initialBalance as any) + totalIncome - totalExpenses;

    return {
      initialBalance: parseFloat(user.initialBalance as any),
      totalIncome,
      totalExpenses,
      currentBalance,
    };
  }
}
