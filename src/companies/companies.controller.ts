import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Company, Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CompanyResponse } from './dto/company-response.dto';
import { CompanyDetails } from './dto/company-details.dto';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEAN)
  @ApiOkResponse({ type: CompanyResponse })
  @ApiResponse({
    status: 400,
    description: 'Компания с таким названием уже существует',
  })
  createCompany(@Body() createCompanyDto: CreateCompanyDto): Promise<Company> {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @ApiOkResponse({ type: CompanyResponse, isArray: true })
  getAllCompanies(): Promise<Company[]> {
    return this.companiesService.getAllCompanies();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEAN)
  @ApiOkResponse({ type: CompanyDetails })
  @ApiResponse({
    status: 404,
    description: 'Компании с таким id не существует',
  })
  getCompanyDetails(@Param('id') id: string): Promise<CompanyDetails> {
    return this.companiesService.getCompanyDetails(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEAN)
  @ApiOkResponse({ type: CompanyResponse })
  @ApiResponse({
    status: 400,
    description: 'Компания с таким названием уже существует',
  })
  @ApiResponse({
    status: 404,
    description: 'Компании с таким id не существует',
  })
  editCompany(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    return this.companiesService.editCompany(id, updateCompanyDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEAN)
  @ApiOkResponse()
  @ApiResponse({
    status: 404,
    description: 'Компании с таким id не существует',
  })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.companiesService.removeCompany(id);
  }
}
