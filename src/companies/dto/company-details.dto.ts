import { ApiProperty } from '@nestjs/swagger';

export class CompanyDetails {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  managers: {
    name: string;
    id: string;
    email: string;
    isConfirmed: boolean;
  }[];
}
