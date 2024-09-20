import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async createEvent(createEventDto: CreateEventDto, managerId: string) {
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      include: { company: true },
    });

    if (!manager) {
      throw new ForbiddenException('Менеджер не найден');
    }

    if (!manager.isConfirmed) {
      throw new ForbiddenException('Менеджер еще не подтвержден');
    }

    return this.prisma.event.create({
      data: {
        title: createEventDto.title,
        description: createEventDto.description,
        date: new Date(createEventDto.date),
        location: createEventDto.location,
        manager: { connect: { id: manager.id } },
        company: { connect: { id: manager.companyId } },
        deadline: createEventDto.deadline
          ? new Date(createEventDto.deadline)
          : null,
      },
    });
  }

  async getAllEvents() {
    return await this.prisma.event.findMany({
      include: {
        manager: true,
        company: true,
      },
    });
  }

  async getRegisteredStudents(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        students: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        manager: true,
      },
    });

    if (!event) {
      throw new ForbiddenException('Событие не найдено');
    }

    return event.students;
  }

  async editEvent(
    id: string,
    updateEventDto: UpdateEventDto,
    managerId: string,
  ) {
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      include: { company: true },
    });

    if (!manager) {
      throw new ForbiddenException('Менеджер не найден');
    }

    if (!manager.isConfirmed) {
      throw new ForbiddenException('Менеджер еще не подтвержден');
    }

    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        manager: { include: { company: true } },
      },
    });

    if (!event) {
      throw new ForbiddenException('Событие не найдено');
    }

    if (manager.companyId !== event.manager.companyId) {
      throw new ForbiddenException(
        'У вас нет прав на редактирование этого события',
      );
    }

    return this.prisma.event.update({
      where: { id },
      data: updateEventDto,
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }

  deleteEvent(id: string) {
    return this.prisma.event.delete({
      where: { id },
    });
  }

  async registerForEvent(eventId: string, studentId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { students: true },
    });

    if (!event) {
      throw new ForbiddenException('Событие не найдено');
    }

    const currentDate = new Date();
    if (event.deadline && currentDate > event.deadline) {
      throw new ForbiddenException('Дедлайн на запись истек');
    }

    const isAlreadyRegistered = event.students.some(
      (student) => student.id === studentId,
    );
    if (isAlreadyRegistered) {
      throw new ForbiddenException('Вы уже зарегистрированы на это событие');
    }

    await this.prisma.event.update({
      where: { id: eventId },
      data: {
        students: {
          connect: { id: studentId },
        },
      },
    });

    return { message: 'Вы успешно записались на событие' };
  }

  async getEventsForStudent(studentId: string) {
    const events = await this.prisma.event.findMany({
      where: {
        students: {
          some: {
            id: studentId,
          },
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        location: true,
        deadline: true,
        manager: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!events || events.length === 0) {
      throw new ForbiddenException('Вы не зарегистрированы ни на одно событие');
    }

    return events;
  }
}
