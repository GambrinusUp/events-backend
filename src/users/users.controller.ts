import {
  Controller,
  Get,
  UseGuards,
  Req,
  Param,
  Patch,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from './role.enum';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('/profile')
  async getProfile(@Req() req: Request) {
    const userId = (req as any).user['id'];
    return this.usersService.getUserProfile(userId);
  }

  @Get('/students')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEAN)
  async getAllStudents() {
    return this.usersService.findAllStudents();
  }

  @Patch(':id/change-role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.DEAN)
  async changeRole(@Param('id') id: string, @Body('role') role: Role) {
    return this.usersService.changeUserRole(id, role);
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.DEAN)
  async getUserById(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
