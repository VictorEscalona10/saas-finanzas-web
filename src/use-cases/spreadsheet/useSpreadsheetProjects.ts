'use client';

import { useCallback, useState } from 'react';
import type { SpreadsheetProject, TemplateId } from '@/src/domain/spreadsheet/types';

const SEED_PROJECTS: Array<Pick<SpreadsheetProject, 'name' | 'template'>> = [
  { name: 'Transacciones demo', template: 'transactions' },
  { name: 'Inventario de items', template: 'items' },
  { name: 'Hoja en blanco', template: 'blank' },
];

function nowIso(): string {
  return new Date().toISOString();
}

function seedProjects(): SpreadsheetProject[] {
  const now = nowIso();
  return SEED_PROJECTS.map((seed, index) => ({
    id: `project-seed-${index}`,
    name: seed.name,
    template: seed.template,
    createdAt: now,
    updatedAt: now,
  }));
}

export function useSpreadsheetProjects() {
  const [projects, setProjects] = useState<SpreadsheetProject[]>(seedProjects);

  const createProject = useCallback((template: TemplateId = 'blank'): SpreadsheetProject => {
    const now = nowIso();
    const project: SpreadsheetProject = {
      id: `project-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      name: SEED_PROJECTS.find((seed) => seed.template === template)?.name ?? 'Hoja sin título',
      template,
      createdAt: now,
      updatedAt: now,
    };
    setProjects((prev) => [project, ...prev]);
    return project;
  }, []);

  const getProject = useCallback(
    (id: string): SpreadsheetProject | null =>
      projects.find((project) => project.id === id) ?? null,
    [projects]
  );

  const touchProject = useCallback((id: string) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id ? { ...project, updatedAt: nowIso() } : project
      )
    );
  }, []);

  return { projects, createProject, getProject, touchProject };
}