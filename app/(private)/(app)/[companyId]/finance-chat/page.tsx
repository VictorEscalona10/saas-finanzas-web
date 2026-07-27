import ChatWidget from '@/src/components/finance-chat/ChatWidget';

export default async function FinanceChatPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  return <ChatWidget companyId={companyId} />;
}
