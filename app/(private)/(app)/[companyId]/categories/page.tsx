'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import CategoryList from '@/src/components/category/CategoryList';
import CategoryForm from '@/src/components/category/CategoryForm';
import CategoryDrawer from '@/src/components/category/CategoryDrawer';
import Button from '@/src/components/shared/Button';
import type { Category } from '@/src/domain/entities/Category';

export default function CategoriesPage() {
  const params = useParams<{ companyId: string }>();
  const companyId = params.companyId;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);

  const isEdit = !!editingCategory;

  const handleNew = useCallback(() => {
    setEditingCategory(null);
    setDrawerOpen(true);
  }, []);

  const handleEdit = useCallback((category: Category) => {
    setEditingCategory(category);
    setDrawerOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    setDrawerOpen(false);
    setEditingCategory(null);
    setRefreshKey((k) => k + 1);
  }, []);

  const handleCancel = useCallback(() => {
    setDrawerOpen(false);
    setEditingCategory(null);
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
        disableClose={saving}
        title={isEdit ? 'Editar Categoría' : 'Nueva Categoría'}
        subtitle="Define la estructura de tus flujos financieros"
        footer={
          <>
            <Button variant="outline" size="lg" onClick={handleCancel} disabled={saving}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="lg"
              type="submit"
              form="category-form"
              loading={saving}
            >
              {saving ? 'Guardando...' : isEdit ? 'Actualizar Categoría' : 'Guardar Categoría'}
            </Button>
          </>
        }
      >
        <CategoryForm
          companyId={companyId}
          category={editingCategory ?? undefined}
          onSave={handleSave}
          onCancel={handleCancel}
          id="category-form"
          hideFooter
          onLoadingChange={setSaving}
        />
      </CategoryDrawer>
    </>
  );
}
