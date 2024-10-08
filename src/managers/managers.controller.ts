import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { ManagersService } from './managers.service';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/roles.decorator';

@ApiTags('managers')
@Controller('managers')
export class ManagersController {
  constructor(private readonly managersService: ManagersService) {}

  @Get('pending')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEAN, Role.MANAGER)
  getManagersPending(@Req() req: Request) {
    const userId = (req as any).user['id'];
    const userRole = (req as any).user['role'];
    return this.managersService.getManagersPending(userId, userRole);
  }

  @Post(':id/approve')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEAN, Role.MANAGER)
  approveManager(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user['id'];
    const userRole = (req as any).user['role'];
    return this.managersService.approveManager(id, userId, userRole);
  }
}
