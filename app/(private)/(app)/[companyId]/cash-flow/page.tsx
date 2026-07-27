import CashFlowScreen from '@/src/components/cash-flow/CashFlowScreen';

export default async function CashFlowPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  return <CashFlowScreen companyId={companyId} />;
}