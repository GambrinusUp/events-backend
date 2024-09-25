import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { PrismaService } from 'prisma/prisma.service';
import { GoogleService } from 'src/google/google.service';

@Module({
  imports: [PrismaModule],
  controllers: [EventsController],
  providers: [EventsService, PrismaService, GoogleService],
})
export class EventsModule {}
