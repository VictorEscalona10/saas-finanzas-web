import ExcelProjectsScreen from '@/src/components/excel/ExcelProjectsScreen/ExcelProjectsScreen';

export default async function ExcelProjectsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  return <ExcelProjectsScreen companyId={companyId} />;
}

export const metadata = {
  title: 'Hojas de Cálculo',
};