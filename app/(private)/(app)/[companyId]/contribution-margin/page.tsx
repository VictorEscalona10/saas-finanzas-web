import ContributionMarginScreen from '@/src/components/contribution/ContributionMarginScreen';

export default async function ContributionMarginPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  return <ContributionMarginScreen companyId={companyId} />;
}
