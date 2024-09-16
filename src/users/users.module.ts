import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { PrismaService } from 'prisma/prisma.service';
import { RolesGuard } from 'src/auth/role.guard';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule), PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, RolesGuard, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
