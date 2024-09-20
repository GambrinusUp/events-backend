import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { ManagersModule } from './managers/managers.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    CompaniesModule,
    ManagersModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
