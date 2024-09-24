import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateEventDto {
  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  date: string;

  @ApiProperty()
  @IsNotEmpty()
  location: string;

  @ApiProperty()
  deadline?: string;
}
