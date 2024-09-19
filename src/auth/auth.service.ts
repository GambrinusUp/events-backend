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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<AuthEntity> {
    const user = await this.prisma.user.findUnique({ where: { email: email } });
    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    return {
      accessToken: this.jwtService.sign({ userId: user.id, role: user.role }),
    };
  }

  async register(createUserDto: CreateUserDto) {
    const { email, name, password, role, companyId } = createUserDto;

    if (role === 'MANAGER') {
      if (!companyId) {
        throw new BadRequestException(
          'Company ID is required for manager registration',
        );
      }

      const existingCompany = await this.prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!existingCompany) {
        throw new BadRequestException('Company with this ID does not exist');
      }
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
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
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;

    return {
      ...result,
      accessToken,
    };
  }
}
