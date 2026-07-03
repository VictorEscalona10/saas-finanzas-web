import { CompanyDetail } from '@/src/components/company/CompanyDetail';

export default async function CompanyDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return <CompanyDetail companyId={id} />;
}
