'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import ItemList from '@/src/components/item/ItemList';
import ItemForm from '@/src/components/item/ItemForm';
import ItemDrawer from '@/src/components/item/ItemDrawer';
import Button from '@/src/components/shared/Button';
import type { Item } from '@/src/domain/entities/Item';

export default function ItemsPage() {
  const params = useParams<{ companyId: string }>();
  const companyId = params.companyId;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleNew = useCallback(() => {
    setEditingItem(undefined);
    setDrawerOpen(true);
  }, []);

  const handleEdit = useCallback((item: Item) => {
    setEditingItem(item);
    setDrawerOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    setDrawerOpen(false);
    setEditingItem(undefined);
    setRefreshKey((k) => k + 1);
  }, []);

  const handleCancel = useCallback(() => {
    setDrawerOpen(false);
    setEditingItem(undefined);
  }, []);

  return (
    <>
      <ItemList
        key={refreshKey}
        companyId={companyId}
        onNew={handleNew}
        onEdit={handleEdit}
      />

      <ItemDrawer
        open={drawerOpen}
        onClose={handleCancel}
        disableClose={saving}
        title={editingItem ? 'Editar Item' : 'Nuevo Item'}
        subtitle={editingItem ? 'Modifica los datos del item seleccionado.' : 'Agrega un nuevo producto o servicio a tu catálogo.'}
        footer={
          <>
            <Button variant="outline" size="lg" onClick={handleCancel} disabled={saving}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="lg"
              type="submit"
              form="item-form"
              loading={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Item'}
            </Button>
          </>
        }
      >
        <ItemForm
          companyId={companyId}
          item={editingItem}
          onSave={handleSave}
          onCancel={handleCancel}
          id="item-form"
          hideFooter
          onLoadingChange={setSaving}
        />
      </ItemDrawer>
    </>
  );
}
