import { Company } from '@/src/domain/entities/Company';

export interface CreateCompanyDto {
  name: string;
}

export interface UpdateCompanyDto {
  name: string;
}

export interface ICompanyRepository {
  create(data: CreateCompanyDto): Promise<Company>;
  update(id: string, data: UpdateCompanyDto): Promise<Company>;
  listMyCompanies(): Promise<Company[]>;
  getById(id: string): Promise<Company>;
}
