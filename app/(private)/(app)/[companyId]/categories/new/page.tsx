'use client';

import { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CategoryForm from '@/src/components/category/CategoryForm';

export default function NewCategoryPage() {
  const params = useParams<{ companyId: string }>();
  const router = useRouter();
  const companyId = params.companyId;

  const handleSave = useCallback(() => {
    router.push(`/${companyId}/categories`);
  }, [companyId, router]);

  const handleCancel = useCallback(() => {
    router.push(`/${companyId}/categories`);
  }, [companyId, router]);

  return (
    <CategoryForm
      companyId={companyId}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
