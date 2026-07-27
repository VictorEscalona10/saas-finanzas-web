import DashboardScreen from '@/src/components/dashboard/DashboardScreen';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  return <DashboardScreen companyId={companyId} />;
}
