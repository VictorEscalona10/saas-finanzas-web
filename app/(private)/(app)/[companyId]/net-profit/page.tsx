import NetProfitScreen from '@/src/components/net-profit/NetProfitScreen';

export default async function NetProfitPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  return <NetProfitScreen companyId={companyId} />;
}
