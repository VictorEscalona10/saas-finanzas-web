'use client';

import { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BatchDetail from '@/src/components/batch/BatchDetail';

export default function BatchDetailPage() {
  const params = useParams<{ companyId: string; batchId: string }>();
  const router = useRouter();
  const { companyId, batchId } = params;

  const handleNewTransaction = useCallback(() => {
    router.push(`/${companyId}/batches/${batchId}/transactions/new`);
  }, [companyId, batchId, router]);

  return (
    <BatchDetail
      companyId={companyId}
      batchId={batchId}
      onNewTransaction={handleNewTransaction}
    />
  );
}
