import { Controller, Get, Put, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    const { password, ...result } = user;
    return result;
  }

  @Put('me/balance')
  async setInitialBalance(@Request() req, @Body() body: { initialBalance: number }) {
    const user = await this.usersService.setInitialBalance(req.user.userId, body.initialBalance);
    const { password, ...result } = user;
    return result;
  }
}
