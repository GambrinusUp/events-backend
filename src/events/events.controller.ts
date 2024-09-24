import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/roles.decorator';
import { EventResponseDto } from './dto/event-response.dto';
import { EditEventResponseDto } from './dto/edit-event.dto';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MANAGER)
  createEvent(
    @Body() createEventDto: CreateEventDto,
    @Req() req: Request,
  ): Promise<EventResponseDto> {
    const managerId = (req as any).user['id'];
    return this.eventsService.createEvent(createEventDto, managerId);
  }

  @Get()
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Начальная дата (опционально)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Конечная дата (опционально)',
  })
  getAllEvents(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<EventResponseDto[]> {
    return this.eventsService.getAllEvents(startDate, endDate);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Get('my-events')
  async getEventsForStudent(
    @Req() req: Request,
  ): Promise<Partial<EventResponseDto>[]> {
    const studentId = (req as any).user['id'];
    return this.eventsService.getEventsForStudent(studentId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MANAGER)
  @Get('company-events')
  async getEventsForCompany(
    @Req() req: Request,
  ): Promise<Partial<EventResponseDto>[]> {
    const managerId = (req as any).user['id'];
    return this.eventsService.getEventsForCompany(managerId);
  }

  @Get(':id/students')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MANAGER, Role.DEAN)
  getRegisteredStudents(@Param('id') eventId: string) {
    return this.eventsService.getRegisteredStudents(eventId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MANAGER)
  editEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Req() req: Request,
  ): Promise<EditEventResponseDto> {
    const managerId = (req as any).user['id'];
    return this.eventsService.editEvent(id, updateEventDto, managerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<EventResponseDto> {
    return this.eventsService.findOne(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MANAGER)
  deleteEvent(@Param('id') id: string) {
    return this.eventsService.deleteEvent(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Post(':id/register')
  async registerForEvent(
    @Param('id') eventId: string,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const studentId = (req as any).user['id'];
    return this.eventsService.registerForEvent(eventId, studentId);
  }
}
