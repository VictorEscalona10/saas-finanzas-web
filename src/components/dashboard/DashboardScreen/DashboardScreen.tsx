'use client';

import Link from 'next/link';
import { useDashboard } from '@/src/use-cases/dashboard/useDashboard';
import { formatUSD, formatBs, formatPercentage } from '@/src/shared/utils/numberUtils';
import { formatForDisplay } from '@/src/shared/utils/dateUtils';
import { differenceInCalendarDays } from 'date-fns';
import './DashboardScreen.css';

interface DashboardScreenProps {
  companyId: string;
  month?: string;
}

function buildChartPath(
  data: Array<{ month: string; revenue: number; expenses: number }>,
  key: 'revenue' | 'expenses',
  width: number,
  height: number,
  padding: number,
): string {
  const n = data.length;
  if (n === 0) return '';

  const maxVal = Math.max(...data.flatMap((d) => [d.revenue, d.expenses]), 1);
  const stepX = (width - padding * 2) / (n - 1 || 1);

  let d = '';
  for (let i = 0; i < n; i++) {
    const x = padding + i * stepX;
    const y = padding + (1 - data[i][key] / maxVal) * (height - padding * 2);
    d += `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }
  return d + `L${padding + (n - 1) * stepX},${height}L${padding},${height}Z`;
}

function buildAreaPath(
  data: Array<{ month: string; revenue: number; expenses: number }>,
  key: 'revenue' | 'expenses',
  width: number,
  height: number,
  padding: number,
): string {
  const n = data.length;
  if (n === 0) return '';

  const maxVal = Math.max(...data.flatMap((d) => [d.revenue, d.expenses]), 1);
  const stepX = (width - padding * 2) / (n - 1 || 1);

  let d = `M${padding},${height}`;
  for (let i = 0; i < n; i++) {
    const x = padding + i * stepX;
    const y = padding + (1 - data[i][key] / maxVal) * (height - padding * 2);
    d += `L${x},${y}`;
  }
  const lastX = padding + (n - 1) * stepX;
  return d + `L${lastX},${height}Z`;
}

function parseLocalDate(dateStr: string): Date | null {
  const datePart = dateStr.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatTxDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  if (!date) return dateStr;
  const now = new Date();
  const diffDays = differenceInCalendarDays(now, date);

  if (diffDays === 0) return `Hoy`;
  if (diffDays === 1) return `Ayer`;
  return formatForDisplay(dateStr);
}

function txIcon(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes('venta') || lower.includes('ingreso')) return 'storefront';
  if (lower.includes('nomina') || lower.includes('sueldo')) return 'badge';
  if (lower.includes('transporte') || lower.includes('logistica')) return 'local_shipping';
  if (lower.includes('servicio') || lower.includes('nube') || lower.includes('cloud')) return 'cloud';
  if (lower.includes('alquiler')) return 'home';
  return 'receipt_long';
}

function isIncomeCategory(category: string): boolean {
  const lower = category.toLowerCase();
  return lower.includes('venta') || lower.includes('ingreso');
}

function statusLabel(status: string): string {
  switch (status) {
    case 'COMPLETED': return 'Completado';
    case 'PENDING': return 'Pendiente';
    default: return status;
  }
}

function Skeleton() {
  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div className="dashboard__skeleton dashboard__skeleton--title" />
        <div className="dashboard__skeleton dashboard__skeleton--subtitle" />
      </div>
      <div className="dashboard__kpi-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="dashboard__kpi-card">
            <div className="dashboard__skeleton dashboard__skeleton--label" />
            <div className="dashboard__skeleton dashboard__skeleton--value" />
            <div className="dashboard__skeleton dashboard__skeleton--trend" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="dashboard">
      <div className="dashboard__error">
        <span className="material-symbols-outlined dashboard__error-icon">error_outline</span>
        <p className="dashboard__error-text">{message}</p>
        <button className="dashboard__error-btn" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    </div>
  );
}

export default function DashboardScreen({ companyId, month }: DashboardScreenProps) {
  const { data, isLoading, error, refetch } = useDashboard(companyId, month);

  console.log(data)

  if (isLoading) return <Skeleton />;

  if (error || !data) {
    return <ErrorState message={error ?? 'No se pudieron cargar los datos'} onRetry={refetch} />;
  }

  const chartWidth = 1000;
  const chartHeight = 300;
  const chartPadding = 40;

  const revenuePath = buildChartPath(data.chartData, 'revenue', chartWidth, chartHeight, chartPadding);
  const expensesPath = buildChartPath(data.chartData, 'expenses', chartWidth, chartHeight, chartPadding);
  const revenueArea = buildAreaPath(data.chartData, 'revenue', chartWidth, chartHeight, chartPadding);
  const expensesArea = buildAreaPath(data.chartData, 'expenses', chartWidth, chartHeight, chartPadding);

  const maxChartVal = Math.max(...data.chartData.flatMap((d) => [d.revenue, d.expenses]), 1);
  const yTicks = [0, 1, 2, 3].map((i) => {
    const val = (maxChartVal / 4) * (3 - i);
    return formatUSD(val);
  });

  const variationIcon = (v: number) =>
    v >= 0 ? 'trending_up' : 'trending_down';

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">Dashboard</h1>
        <p className="dashboard__subtitle">
          {data.period.start} – {data.period.end}
        </p>
      </div>

      <div className="dashboard__kpi-grid">
        <div className="dashboard__kpi-card">
          <div className="dashboard__kpi-label">Balance Actual</div>
          <div className="dashboard__kpi-values">
            <span className="dashboard__kpi-primary">{formatUSD(data.currentBalance.usd)}</span>
            <span className="dashboard__kpi-secondary">{formatBs(data.currentBalance.bs)}</span>
          </div>
        </div>

        <div className="dashboard__kpi-card">
          <div className="dashboard__kpi-label">Ingresos del Mes</div>
          <div className="dashboard__kpi-primary">{formatUSD(data.monthlyRevenue.usd)}</div>
          <div className="dashboard__kpi-sub">
            <span className={`material-symbols-outlined dashboard__kpi-trend-icon`}>
              {variationIcon(data.monthlyRevenue.variation)}
            </span>
            {data.monthlyRevenue.variation >= 0 ? '+' : ''}{data.monthlyRevenue.variation.toFixed(1)}% vs mes anterior
          </div>
        </div>

        <div className="dashboard__kpi-card">
          <div className="dashboard__kpi-label">Gastos del Mes</div>
          <div className="dashboard__kpi-primary">{formatUSD(data.monthlyExpenses.usd)}</div>
          <div className={`dashboard__kpi-sub ${data.monthlyExpenses.variation > 0 ? 'dashboard__kpi-sub--down' : ''}`}>
            <span className={`material-symbols-outlined dashboard__kpi-trend-icon`}>
              {variationIcon(-data.monthlyExpenses.variation)}
            </span>
            {data.monthlyExpenses.variation >= 0 ? '+' : ''}{data.monthlyExpenses.variation.toFixed(1)}% vs mes anterior
          </div>
        </div>

        <div className="dashboard__kpi-card">
          <div className="dashboard__kpi-label">Utilidad Neta</div>
          <div className="dashboard__kpi-primary">{formatUSD(data.netProfit.usd)}</div>
          <span className="dashboard__badge">{formatPercentage(data.netProfit.margin)} margen</span>
        </div>
      </div>

      <div className="dashboard__row">
        <div className="dashboard__chart">
          <div className="dashboard__chart-header">
            <h3 className="dashboard__chart-title">Ingresos vs Gastos</h3>
            <div className="dashboard__chart-legend">
              <span className="dashboard__legend-item">
                <span className="dashboard__legend-dot dashboard__legend-dot--income" />
                Ingresos
              </span>
              <span className="dashboard__legend-item">
                <span className="dashboard__legend-dot dashboard__legend-dot--expense" />
                Gastos
              </span>
            </div>
          </div>
          <div className="dashboard__chart-body">
            <svg className="dashboard__svg" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
              {[0, 1, 2, 3].map((i) => (
                <line
                  key={i}
                  stroke="#233554"
                  strokeWidth="1"
                  x1="0"
                  x2={chartWidth}
                  y1={(chartHeight / 4) * i}
                  y2={(chartHeight / 4) * i}
                />
              ))}
              <defs>
                <linearGradient id="incomeGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#38debb" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#38debb" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#ffb4ab" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#ffb4ab" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={revenueArea} fill="url(#incomeGrad)" />
              <path d={expensesArea} fill="url(#expenseGrad)" />
              <path d={revenuePath.replace(/Z$/, '')} fill="none" stroke="#38debb" strokeLinejoin="round" strokeWidth="3" />
              <path d={expensesPath.replace(/Z$/, '')} fill="none" stroke="#ffb4ab" strokeLinejoin="round" strokeWidth="3" />
            </svg>
            <div className="dashboard__chart-labels">
              <div className="dashboard__chart-y-labels">
                {yTicks.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              <div className="dashboard__chart-x-labels">
                {data.chartData.map((d) => (
                  <span key={d.month}>{d.month}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard__recent">
          <h3 className="dashboard__recent-title">Transacciones Recientes</h3>
          <div className="dashboard__recent-list">
            {data.recentTransactions.map((tx) => {
              const isIncome = isIncomeCategory(tx.category);
              return (
                <div key={tx.id} className="dashboard__tx">
                  <div className={`dashboard__tx-icon ${isIncome ? 'dashboard__tx-icon--green' : 'dashboard__tx-icon--blue'}`}>
                    <span className="material-symbols-outlined">{txIcon(tx.category)}</span>
                  </div>
                  <div className="dashboard__tx-info">
                    <span className="dashboard__tx-name">{tx.description ?? tx.category}</span>
                    <span className="dashboard__tx-date">{formatTxDate(tx.date)}</span>
                  </div>
                  <div className="dashboard__tx-amount">
                    <span className="dashboard__tx-value">{formatUSD(tx.amountUSD)}</span>
                    <span className={`dashboard__tx-status ${tx.status !== 'COMPLETED' ? 'dashboard__tx-status--pending' : ''}`}>
                      {statusLabel(tx.status)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="dashboard__quick">
        <Link href="/transactions/new" className="dashboard__quick-btn">
          <span className="dashboard__quick-icon material-symbols-outlined">receipt_long</span>
          <span className="dashboard__quick-label">Nueva Transacción</span>
        </Link>
        <Link href="/products/new" className="dashboard__quick-btn">
          <span className="dashboard__quick-icon material-symbols-outlined">inventory_2</span>
          <span className="dashboard__quick-label">Nuevo Producto</span>
        </Link>
        <Link href="/batches/new" className="dashboard__quick-btn">
          <span className="dashboard__quick-icon material-symbols-outlined">precision_manufacturing</span>
          <span className="dashboard__quick-label">Nuevo Lote</span>
        </Link>
        <Link href="/cash-flow" className="dashboard__quick-btn">
          <span className="dashboard__quick-icon material-symbols-outlined">payments</span>
          <span className="dashboard__quick-label">Flujo de Caja</span>
        </Link>
        <Link href="/contribution-margin" className="dashboard__quick-btn">
          <span className="dashboard__quick-icon material-symbols-outlined">analytics</span>
          <span className="dashboard__quick-label">Margen</span>
        </Link>
        <Link href="/finance-chat" className="dashboard__quick-btn dashboard__quick-btn--highlight">
          <span className="dashboard__quick-icon material-symbols-outlined">smart_toy</span>
          <span className="dashboard__quick-label">Chat IA</span>
        </Link>
      </div>
    </div>
  );
}
