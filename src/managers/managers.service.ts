import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ManagersService {
  constructor(private prisma: PrismaService) {}

  async getManagersPending() {
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

  async approveManager(managerId: string) {
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
    });

    if (!manager) {
      throw new NotFoundException(`Manager with id ${managerId} not found`);
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
