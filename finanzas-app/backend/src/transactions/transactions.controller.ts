import { Controller, Get, Post, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get('summary')
  getSummary(@Request() req) {
    return this.transactionsService.getSummary(req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    return this.transactionsService.findAll(req.user.userId);
  }

  @Post()
  create(
    @Request() req,
    @Body() body: { amount: number; type: string; description?: string; categoryId?: number },
  ) {
    return this.transactionsService.create(
      req.user.userId,
      body.amount,
      body.type,
      body.description,
      body.categoryId,
    );
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.transactionsService.remove(+id, req.user.userId);
  }
}
