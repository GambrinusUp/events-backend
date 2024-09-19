import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto) {
    const { name } = createCompanyDto;
    const existingCompany = await this.prisma.company.findFirst({
      where: { name: name },
    });
    if (existingCompany) {
      throw new BadRequestException('Company with this name already exists');
    }
    const company = await this.prisma.company.create({ data: { name: name } });
    return company;
  }

  async getAllCompanies() {
    const companies = await this.prisma.company.findMany();
    return companies;
  }

  async getCompanyDetails(id: string) {
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
      throw new NotFoundException(`Company with id ${id} not found`);
    }

    return company;
  }

  async editCompany(id: string, updateCompanyDto: UpdateCompanyDto) {
    const existingCompany = await this.prisma.company.findUnique({
      where: { id: id },
    });

    if (!existingCompany) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }

    const { name } = updateCompanyDto;

    const companyWithSameName = await this.prisma.company.findFirst({
      where: { name: name },
    });

    if (companyWithSameName && companyWithSameName.id !== id) {
      throw new BadRequestException('Company with this name already exists');
    }

    const updatedCompany = await this.prisma.company.update({
      where: { id: id },
      data: {
        name: name,
      },
    });

    return updatedCompany;
  }

  async removeCompany(id: string) {
    const existingCompany = await this.prisma.company.findUnique({
      where: { id: id },
    });

    if (!existingCompany) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }

    await this.prisma.company.delete({
      where: { id: id },
    });

    return { message: `Company with id ${id} has been deleted successfully` };
  }
}
