import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Company } from '@prisma/client';
import { CompanyDetails } from './dto/company-details.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const { name } = createCompanyDto;
    const existingCompany = await this.prisma.company.findFirst({
      where: { name: name },
    });
    if (existingCompany) {
      throw new BadRequestException(
        'Компания с таким названием уже существует',
      );
    }
    const company = await this.prisma.company.create({ data: { name: name } });
    return company;
  }

  async getAllCompanies(): Promise<Company[]> {
    const companies = await this.prisma.company.findMany();
    return companies;
  }

  async getCompanyDetails(id: string): Promise<CompanyDetails> {
    const company = await this.prisma.company.findUnique({
      where: { id: id },
      include: {
        managers: {
          select: {
            id: true,
            name: true,
            email: true,
            isConfirmed: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException(`Компании с id ${id} не существует`);
    }

    return company;
  }

  async editCompany(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const existingCompany = await this.prisma.company.findUnique({
      where: { id: id },
    });

    if (!existingCompany) {
      throw new NotFoundException(`Компания с id ${id} не найдена`);
    }

    const { name } = updateCompanyDto;

    const companyWithSameName = await this.prisma.company.findFirst({
      where: { name: name },
    });

    if (companyWithSameName && companyWithSameName.id !== id) {
      throw new BadRequestException(
        'Компания с таким названием уже существует',
      );
    }

    const updatedCompany = await this.prisma.company.update({
      where: { id: id },
      data: {
        name: name,
      },
    });

    return updatedCompany;
  }

  async removeCompany(id: string): Promise<{ message: string }> {
    const existingCompany = await this.prisma.company.findUnique({
      where: { id: id },
    });

    if (!existingCompany) {
      throw new NotFoundException(`Компания с id ${id} не найдена`);
    }

    await this.prisma.company.delete({
      where: { id: id },
    });

    return { message: `Компания с id ${id} была успешно удалена` };
  }
}
