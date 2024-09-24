import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class RegisterResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  role: Role;

  @ApiProperty()
  isConfirmed: boolean;

  @ApiProperty()
  companyId: string | null;

  @ApiProperty()
  accessToken: string;
}
