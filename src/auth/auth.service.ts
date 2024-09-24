import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { AuthEntity } from './entities/auth.entity';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterResponse } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<AuthEntity> {
    const user = await this.prisma.user.findUnique({ where: { email: email } });

    if (!user) {
      throw new NotFoundException(`Нет пользователя с таким email: ${email}`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неправильный пароль');
    }

    return {
      accessToken: this.jwtService.sign({
        userId: user.id,
        role: user.role,
        isConfirmed: user.isConfirmed,
      }),
    };
  }

  async register(createUserDto: CreateUserDto): Promise<RegisterResponse> {
    const { email, name, password, role, companyId } = createUserDto;

    if (role === 'MANAGER') {
      if (!companyId) {
        throw new BadRequestException(
          'Для регистрации менеджера требуется id компании',
        );
      }

      const existingCompany = await this.prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!existingCompany) {
        throw new BadRequestException('Компании с таким id не существует');
      }
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException(
        'Пользователь с таким email уже существует',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role, // Роль (STUDENT, MANAGER, DEAN)
        companyId: role === 'MANAGER' ? companyId : null,
      },
    });

    const accessToken = this.jwtService.sign({
      userId: user.id,
      role: user.role,
      isConfirmed: user.isConfirmed,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;

    return {
      ...result,
      accessToken,
    };
  }
}
