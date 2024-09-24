import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class ManagersService {
  constructor(private prisma: PrismaService) {}

  async getManagersPending(userId: string, userRole: Role) {
    if (userRole === 'DEAN') {
      const managers = await this.prisma.user.findMany({
        where: {
          role: 'MANAGER',
          isConfirmed: false,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isConfirmed: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return managers;
    }

    const manager = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        companyId: true,
        isConfirmed: true,
      },
    });

    if (!manager || !manager.companyId) {
      throw new NotFoundException('Менеджер или его компания не найдены');
    }

    if (!manager.isConfirmed) {
      throw new ForbiddenException(
        'Вы не можете просматривать менеджеров, пока сами не подтверждены',
      );
    }

    const managers = await this.prisma.user.findMany({
      where: {
        companyId: manager.companyId,
        role: 'MANAGER',
        isConfirmed: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isConfirmed: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return managers;
  }

  async approveManager(managerId: string, userId: string, userRole: Role) {
    if (userRole === 'DEAN') {
      await this.prisma.user.update({
        where: { id: managerId },
        data: {
          isConfirmed: true,
        },
      });

      return {
        message: `Manager with id ${managerId} successfully approved by DEAN`,
      };
    }

    const currentManager = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        companyId: true,
        isConfirmed: true,
      },
    });

    if (!currentManager || !currentManager.companyId) {
      throw new NotFoundException('Менеджер не найден');
    }

    if (!currentManager.isConfirmed) {
      throw new ForbiddenException(
        'Вы не можете подтверждать других менеджеров, пока сами не подтверждены',
      );
    }

    const managerToApprove = await this.prisma.user.findUnique({
      where: { id: managerId },
    });

    if (
      !managerToApprove ||
      managerToApprove.companyId !== currentManager.companyId
    ) {
      throw new ForbiddenException(
        'Вы можете подтверждать только менеджеров своей компании',
      );
    }

    await this.prisma.user.update({
      where: { id: managerId },
      data: {
        isConfirmed: true,
      },
    });

    return { message: `Manager with id ${managerId} successfully approved` };
  }
}
