import BalancePointScreen from '@/src/components/balance-point/BalancePointScreen';

export default async function BalancePointPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  return <BalancePointScreen companyId={companyId} />;
}