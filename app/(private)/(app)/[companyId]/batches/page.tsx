'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import BatchList from '@/src/components/batch/BatchList';
import BatchForm from '@/src/components/batch/BatchForm';
import BatchDrawer from '@/src/components/batch/BatchDrawer';
import Button from '@/src/components/shared/Button';

export default function BatchesPage() {
  const params = useParams<{ companyId: string }>();
  const companyId = params.companyId;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleNew = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const handleCancel = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  return (
    <>
      <BatchList
        companyId={companyId}
        onNew={handleNew}
      />

      <BatchDrawer
        open={drawerOpen}
        onClose={handleCancel}
        disableClose={saving}
        title="Nuevo Lote de Producción"
        subtitle="Ingrese los datos del lote de producción."
        footer={
          <>
            <Button variant="outline" size="lg" onClick={handleCancel} disabled={saving}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="lg"
              type="submit"
              form="batch-form"
              loading={saving}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </>
        }
      >
        <BatchForm
          companyId={companyId}
          onCancel={handleCancel}
          id="batch-form"
          hideFooter
          onLoadingChange={setSaving}
        />
      </BatchDrawer>
    </>
  );
}
