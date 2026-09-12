import UnitCostScreen from '@/src/components/unit-cost/UnitCostScreen';

export default async function UnitCostPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  return <UnitCostScreen companyId={companyId} />;
}
