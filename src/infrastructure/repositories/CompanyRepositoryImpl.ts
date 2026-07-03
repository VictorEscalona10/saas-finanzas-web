import { createApiClientWithToken } from '@/src/infrastructure/api/apiClient';
import type { ICompanyRepository, CreateCompanyDto, UpdateCompanyDto } from '@/src/domain/repositories/ICompanyRepository';
import type { Company } from '@/src/domain/entities/Company';

export class CompanyRepositoryImpl implements ICompanyRepository {
  private api;

  constructor(token: string) {
    this.api = createApiClientWithToken(token);
  }

  async create(data: CreateCompanyDto): Promise<Company> {
    const { data: company } = await this.api.post<Company>('/company/create', data);
    return company;
  }

  async update(id: string, data: UpdateCompanyDto): Promise<Company> {
    const { data: company } = await this.api.patch<Company>(`/company/update/${id}`, data);
    return company;
  }

  async listMyCompanies(): Promise<Company[]> {
    const { data: companies } = await this.api.get<Company[]>('/company/my-companies');
    return companies;
  }

  async getById(id: string): Promise<Company> {
    const { data: company } = await this.api.get<Company>(`/company/${id}`);
    return company;
  }
}
