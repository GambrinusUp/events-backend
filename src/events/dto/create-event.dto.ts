import { IsNotEmpty } from 'class-validator';

export class CreateEventDto {
  @IsNotEmpty()
  title: string;

  description?: string;

  @IsNotEmpty()
  date: string;

  @IsNotEmpty()
  location: string;

  deadline?: string;
}
