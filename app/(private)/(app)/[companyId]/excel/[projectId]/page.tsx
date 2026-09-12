import ExcelScreen from '@/src/components/excel/ExcelScreen/ExcelScreen';

export default async function ExcelProjectPage({
  params,
}: {
  params: Promise<{ companyId: string; projectId: string }>;
}) {
  const { companyId, projectId } = await params;
  return <ExcelScreen companyId={companyId} projectId={projectId} />;
}

export const metadata = {
  title: 'Hoja de Cálculo',
};