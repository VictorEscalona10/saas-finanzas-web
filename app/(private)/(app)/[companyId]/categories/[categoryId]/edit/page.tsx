'use client';

import { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCategoryById } from '@/src/use-cases/category/useCategoryById';
import CategoryForm from '@/src/components/category/CategoryForm';
import Skeleton from '@/src/components/shared/Skeleton';

export default function EditCategoryPage() {
  const params = useParams<{ companyId: string; categoryId: string }>();
  const router = useRouter();
  const companyId = params.companyId;
  const categoryId = params.categoryId;

  const { category, isLoading, error } = useCategoryById(companyId, categoryId);

  const handleSave = useCallback(() => {
    router.push(`/${companyId}/categories`);
  }, [companyId, router]);

  const handleCancel = useCallback(() => {
    router.push(`/${companyId}/categories`);
  }, [companyId, router]);

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        gap: '1rem',
        color: '#ef4444',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '3rem' }}>error_outline</span>
        <p>{error ?? 'Categoría no encontrada'}</p>
      </div>
    );
  }

  return (
    <CategoryForm
      companyId={companyId}
      category={category}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
