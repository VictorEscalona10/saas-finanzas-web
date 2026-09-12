import GrossProfitScreen from '@/src/components/gross-profit/GrossProfitScreen';

export default async function GrossProfitPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  return <GrossProfitScreen companyId={companyId} />;
}
