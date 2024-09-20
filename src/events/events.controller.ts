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
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/roles.decorator';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MANAGER)
  createEvent(@Body() createEventDto: CreateEventDto, @Req() req: Request) {
    const managerId = (req as any).user['id'];
    return this.eventsService.createEvent(createEventDto, managerId);
  }

  @Get()
  getAllEvents() {
    return this.eventsService.getAllEvents();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Get('my-events')
  async getEventsForStudent(@Req() req: Request) {
    const studentId = (req as any).user['id'];
    return this.eventsService.getEventsForStudent(studentId);
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
  ) {
    const managerId = (req as any).user['id'];
    return this.eventsService.editEvent(id, updateEventDto, managerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
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
  async registerForEvent(@Param('id') eventId: string, @Req() req: Request) {
    const studentId = (req as any).user['id'];
    return this.eventsService.registerForEvent(eventId, studentId);
  }
}
