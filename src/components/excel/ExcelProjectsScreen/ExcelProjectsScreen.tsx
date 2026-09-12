'use client';

import { useRouter } from 'next/navigation';
import { useSpreadsheetProjects } from '@/src/use-cases/spreadsheet/useSpreadsheetProjects';
import { TEMPLATE_LABELS } from '@/src/domain/spreadsheet/templates';
import { formatForDisplay } from '@/src/shared/utils/dateUtils';
import './ExcelProjectsScreen.css';

interface ExcelProjectsScreenProps {
  companyId: string;
}

export default function ExcelProjectsScreen({ companyId }: ExcelProjectsScreenProps) {
  const router = useRouter();
  const { projects, createProject } = useSpreadsheetProjects();

  const handleCreate = () => {
    const project = createProject('blank');
    router.push(`/${companyId}/excel/${project.id}`);
  };

  const openProject = (id: string) => {
    router.push(`/${companyId}/excel/${id}`);
  };

  return (
    <div className="excel-projects">
      <div className="excel-projects__header">
        <div>
          <h1 className="excel-projects__title">Hojas de Cálculo</h1>
          <p className="excel-projects__subtitle">
            Crea y administra tus hojas de cálculo aisladas de la base de datos
          </p>
        </div>
        <button
          type="button"
          className="excel-projects__create-btn"
          onClick={handleCreate}
        >
          <span className="material-symbols-outlined excel-projects__create-icon">add</span>
          Crear hoja de cálculo
        </button>
      </div>

      <div className="excel-projects__grid">
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            className="excel-projects__card"
            onClick={() => openProject(project.id)}
          >
            <div className="excel-projects__card-icon">
              <span className="material-symbols-outlined excel-projects__card-icon-symbol">grid_on</span>
            </div>
            <div className="excel-projects__card-body">
              <h2 className="excel-projects__card-name">{project.name}</h2>
              <span className="excel-projects__card-template">
                {TEMPLATE_LABELS[project.template]}
              </span>
            </div>
            <div className="excel-projects__card-meta">
              <span className="excel-projects__card-date">
                Actualizado {formatForDisplay(project.updatedAt)}
              </span>
              <span className="material-symbols-outlined excel-projects__card-chevron">arrow_forward_ios</span>
            </div>
          </button>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="excel-projects__empty">
          <span className="material-symbols-outlined excel-projects__empty-icon">grid_on</span>
          <p className="excel-projects__empty-text">
            Aún no tienes hojas de cálculo. Crea la primera.
          </p>
        </div>
      )}
    </div>
  );
}