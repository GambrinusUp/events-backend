import { ApiProperty } from '@nestjs/swagger';

export class CompanyResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}
