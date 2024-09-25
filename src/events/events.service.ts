import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'prisma/prisma.service';
import { EventResponseDto } from './dto/event-response.dto';
import { EditEventResponseDto } from './dto/edit-event.dto';
import { GoogleService } from 'src/google/google.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private googleService: GoogleService,
  ) {}

  async createEvent(
    createEventDto: CreateEventDto,
    managerId: string,
  ): Promise<EventResponseDto> {
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

    const eventDate = new Date(createEventDto.date);
    const deadline = createEventDto.deadline
      ? new Date(createEventDto.deadline)
      : null;

    if (deadline && deadline < eventDate) {
      throw new BadRequestException('Делайн не может быть раньше даты события');
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
      include: {
        manager: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        company: true,
      },
    });
  }

  async getAllEvents(
    startDate?: string,
    endDate?: string,
  ): Promise<EventResponseDto[]> {
    const where: any = {};

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      where.date = {
        lte: new Date(endDate),
      };
    }

    return await this.prisma.event.findMany({
      where,
      include: {
        manager: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        company: true,
      },
      orderBy: {
        date: 'asc',
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
  ): Promise<EditEventResponseDto> {
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

    const updatedDate = updateEventDto.date
      ? new Date(updateEventDto.date)
      : new Date(event.date);
    const updatedDeadline = updateEventDto.deadline
      ? new Date(updateEventDto.deadline)
      : event.deadline;

    if (updatedDeadline && updatedDeadline < updatedDate) {
      throw new BadRequestException(
        'Deadline не может быть раньше даты события',
      );
    }

    return this.prisma.event.update({
      where: { id },
      data: updateEventDto,
    });
  }

  async findOne(id: string): Promise<EventResponseDto> {
    return await this.prisma.event.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        company: true,
      },
    });
  }

  async deleteEvent(id: string) {
    return await this.prisma.event.delete({
      where: { id },
    });
  }

  async registerForEvent(
    eventId: string,
    studentId: string,
  ): Promise<{ message: string }> {
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

    const user = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
      },
    });

    if (user && user.googleAccessToken && user.googleRefreshToken) {
      const eventDetails = {
        title: event.title,
        description: event.description,
        startDate: event.date.toISOString(),
        endDate: new Date(new Date(event.date).getTime() + 60 * 60 * 1000),
      };

      await this.googleService.addEventToCalendar(eventDetails, studentId);
    }

    return { message: 'Вы успешно записались на событие' };
  }

  async getEventsForStudent(
    studentId: string,
  ): Promise<Partial<EventResponseDto>[]> {
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
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        company: true,
      },
    });

    /*if (!events || events.length === 0) {
      throw new ForbiddenException('Вы не зарегистрированы ни на одно событие');
    }*/

    return events;
  }

  async getEventsForCompany(
    managerID: string,
  ): Promise<Partial<EventResponseDto>[]> {
    const manager = await this.prisma.user.findUnique({
      where: { id: managerID },
      select: { companyId: true },
    });

    if (!manager || !manager.companyId) {
      throw new Error('Менеджер не принадлежит компании или не найден');
    }

    const events = await this.prisma.event.findMany({
      where: {
        companyId: manager.companyId,
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
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        company: true,
      },
    });

    return events;
  }
}
