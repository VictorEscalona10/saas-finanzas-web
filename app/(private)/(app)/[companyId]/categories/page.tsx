'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CategoryList from '@/src/components/category/CategoryList';
import CategoryForm from '@/src/components/category/CategoryForm';
import CategoryDrawer from '@/src/components/category/CategoryDrawer';
import Button from '@/src/components/shared/Button';

export default function CategoriesPage() {
  const params = useParams<{ companyId: string }>();
  const router = useRouter();
  const companyId = params.companyId;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNew = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const handleEdit = useCallback((category: { id: string }) => {
    router.push(`/${companyId}/categories/${category.id}/edit`);
  }, [companyId, router]);

  const handleSave = useCallback(() => {
    setDrawerOpen(false);
    setRefreshKey((k) => k + 1);
  }, []);

  const handleCancel = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  return (
    <>
      <CategoryList
        key={refreshKey}
        companyId={companyId}
        onNew={handleNew}
        onEdit={handleEdit}
      />

      <CategoryDrawer
        open={drawerOpen}
        onClose={handleCancel}
        title="Nueva Categoría"
        subtitle="Define la estructura de tus flujos financieros"
        footer={
          <>
            <Button variant="outline" size="lg" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="lg"
              type="submit"
              form="category-form"
            >
              Guardar Categoría
            </Button>
          </>
        }
      >
        <CategoryForm
          companyId={companyId}
          onSave={handleSave}
          onCancel={handleCancel}
          id="category-form"
          hideFooter
        />
      </CategoryDrawer>
    </>
  );
}
