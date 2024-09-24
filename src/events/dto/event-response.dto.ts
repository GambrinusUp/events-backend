import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

class ManagerResponse {
  @ApiProperty({ example: '964743d9-cde6-4172-bfa5-057b627610fc' })
  id: string;

  @ApiProperty({ example: 'john.doe1@example.com' })
  email: string;

  @ApiProperty({ example: 'test' })
  name: string;

  @ApiProperty({ example: 'MANAGER' })
  role: Role;
}

class CompanyResponse {
  @ApiProperty({ example: 'a9dbfc78-9452-4f09-9d02-d0952a1324f0' })
  id: string;

  @ApiProperty({ example: 'Т-Банк' })
  name: string;
}

export class EventResponseDto {
  @ApiProperty({ example: 'f38d45cb-7de5-4b7b-8939-76f269bbf0e3' })
  id: string;

  @ApiProperty({ example: 'Event title' })
  title: string;

  @ApiProperty({ example: 'Event description', nullable: true })
  description: string | null;

  @ApiProperty({
    example: '2024-10-10T00:00:00.000Z',
    description: 'Date of the event in ISO format',
  })
  date: Date;

  @ApiProperty({
    example: 'New York, 5th Avenue',
    description: 'Location of the event',
  })
  location: string;

  @ApiProperty({ example: '964743d9-cde6-4172-bfa5-057b627610fc' })
  managerId: string;

  @ApiProperty({
    example: '2024-10-09T00:00:00.000Z',
    description: 'Deadline in ISO format',
    nullable: true,
  })
  deadline: Date | null;

  @ApiProperty({ example: 'a9dbfc78-9452-4f09-9d02-d0952a1324f0' })
  companyId: string;

  @ApiProperty({ type: ManagerResponse })
  manager: ManagerResponse;

  @ApiProperty({ type: CompanyResponse })
  company: CompanyResponse;
}

/*{
  "id": "f38d45cb-7de5-4b7b-8939-76f269bbf0e3",
  "title": "string",
  "description": "string",
  "date": "2024-10-10T00:00:00.000Z",
  "location": "string",
  "managerId": "964743d9-cde6-4172-bfa5-057b627610fc",
  "deadline": null,
  "companyId": "a9dbfc78-9452-4f09-9d02-d0952a1324f0",
  "manager": {
    "id": "964743d9-cde6-4172-bfa5-057b627610fc",
    "email": "john.doe1@example.com",
    "name": "test",
    "role": "MANAGER"
  },
  "company": {
    "id": "a9dbfc78-9452-4f09-9d02-d0952a1324f0",
    "name": "Т-Банк"
  }
}*/
