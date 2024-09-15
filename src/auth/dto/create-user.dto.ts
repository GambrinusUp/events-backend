import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'STUDENT', enum: Role })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
