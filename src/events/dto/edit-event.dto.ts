/*
{
  "id": "33319175-4f5b-434f-b3fe-f31f7d2ecef2",
  "title": "string12",
  "description": "string2",
  "date": "2024-10-15T00:00:00.000Z",
  "location": "string",
  "managerId": "964743d9-cde6-4172-bfa5-057b627610fc",
  "deadline": null,
  "companyId": "a9dbfc78-9452-4f09-9d02-d0952a1324f0"
}
*/

import { ApiProperty } from '@nestjs/swagger';

export class EditEventResponseDto {
  @ApiProperty({ example: '33319175-4f5b-434f-b3fe-f31f7d2ecef2' })
  id: string;

  @ApiProperty({ example: 'string12' })
  title: string;

  @ApiProperty({ example: 'string2', nullable: true })
  description: string | null;

  @ApiProperty({
    example: '2024-10-15T00:00:00.000Z',
    description: 'Event date in ISO format',
  })
  date: Date;

  @ApiProperty({
    example: 'New York, 5th Avenue',
    description: 'Event location',
  })
  location: string;

  @ApiProperty({ example: '964743d9-cde6-4172-bfa5-057b627610fc' })
  managerId: string;

  @ApiProperty({
    example: null,
    description: 'Deadline in ISO format or null if not set',
    nullable: true,
  })
  deadline: Date | null;

  @ApiProperty({ example: 'a9dbfc78-9452-4f09-9d02-d0952a1324f0' })
  companyId: string;
}
