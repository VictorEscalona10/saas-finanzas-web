'use client';

import Link from 'next/link';
import './DashboardScreen.css';

export default function DashboardScreen() {
  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">Dashboard</h1>
        <p className="dashboard__subtitle">Resumen financiero institucional</p>
      </div>

      <div className="dashboard__kpi-grid">
        <div className="dashboard__kpi-card">
          <div className="dashboard__kpi-label">Balance Actual</div>
          <div className="dashboard__kpi-values">
            <span className="dashboard__kpi-primary">$42,850.00</span>
            <span className="dashboard__kpi-secondary">Bs. 1,564,882.00</span>
          </div>
          <div className="dashboard__kpi-trend dashboard__kpi-trend--up">
            <span className="material-symbols-outlined dashboard__kpi-trend-icon">trending_up</span>
            +2.4%
          </div>
        </div>

        <div className="dashboard__kpi-card">
          <div className="dashboard__kpi-label">Ingresos del Mes</div>
          <div className="dashboard__kpi-primary">$18,250.00</div>
          <div className="dashboard__kpi-sub">+12% vs mes anterior</div>
        </div>

        <div className="dashboard__kpi-card">
          <div className="dashboard__kpi-label">Gastos del Mes</div>
          <div className="dashboard__kpi-primary">$9,380.00</div>
          <div className="dashboard__kpi-sub dashboard__kpi-sub--down">-5% vs mes anterior</div>
        </div>

        <div className="dashboard__kpi-card">
          <div className="dashboard__kpi-label">Utilidad Neta</div>
          <div className="dashboard__kpi-primary">$8,870.00</div>
          <span className="dashboard__badge">24.5% margen</span>
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
            <svg className="dashboard__svg" viewBox="0 0 1000 300" preserveAspectRatio="none">
              <line stroke="#233554" strokeWidth="1" x1="0" x2="1000" y1="0" y2="0" />
              <line stroke="#233554" strokeWidth="1" x1="0" x2="1000" y1="75" y2="75" />
              <line stroke="#233554" strokeWidth="1" x1="0" x2="1000" y1="150" y2="150" />
              <line stroke="#233554" strokeWidth="1" x1="0" x2="1000" y1="225" y2="225" />
              <line stroke="#233554" strokeWidth="1" x1="0" x2="1000" y1="300" y2="300" />
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
              <path d="M0,300 L0,220 L150,180 L300,120 L450,140 L600,80 L750,90 L900,40 L1000,20 L1000,300 Z" fill="url(#incomeGrad)" />
              <path d="M0,300 L0,250 L150,230 L300,200 L450,210 L600,180 L750,195 L900,170 L1000,160 L1000,300 Z" fill="url(#expenseGrad)" />
              <path d="M0,220 L150,180 L300,120 L450,140 L600,80 L750,90 L900,40 L1000,20" fill="none" stroke="#38debb" strokeLinejoin="round" strokeWidth="3" />
              <path d="M0,250 L150,230 L300,200 L450,210 L600,180 L750,195 L900,170 L1000,160" fill="none" stroke="#ffb4ab" strokeLinejoin="round" strokeWidth="3" />
            </svg>
            <div className="dashboard__chart-labels">
              <div className="dashboard__chart-y-labels">
                <span>25k</span>
                <span>15k</span>
                <span>5k</span>
              </div>
              <div className="dashboard__chart-x-labels">
                <span>Ene</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Abr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Ago</span>
                <span>Sep</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard__recent">
          <h3 className="dashboard__recent-title">Transacciones Recientes</h3>
          <div className="dashboard__recent-list">
            <div className="dashboard__tx">
              <div className="dashboard__tx-icon dashboard__tx-icon--green">
                <span className="material-symbols-outlined">cloud</span>
              </div>
              <div className="dashboard__tx-info">
                <span className="dashboard__tx-name">Amazon Web Svc</span>
                <span className="dashboard__tx-date">Hoy, 10:45 AM</span>
              </div>
              <div className="dashboard__tx-amount">
                <span className="dashboard__tx-value">$145.20</span>
                <span className="dashboard__tx-status">Completado</span>
              </div>
            </div>
            <div className="dashboard__tx">
              <div className="dashboard__tx-icon dashboard__tx-icon--blue">
                <span className="material-symbols-outlined">badge</span>
              </div>
              <div className="dashboard__tx-info">
                <span className="dashboard__tx-name">Pago de Nómina</span>
                <span className="dashboard__tx-date">Ayer, 04:15 PM</span>
              </div>
              <div className="dashboard__tx-amount">
                <span className="dashboard__tx-value">$2,400.00</span>
                <span className="dashboard__tx-status dashboard__tx-status--pending">Pendiente</span>
              </div>
            </div>
            <div className="dashboard__tx">
              <div className="dashboard__tx-icon dashboard__tx-icon--green">
                <span className="material-symbols-outlined">storefront</span>
              </div>
              <div className="dashboard__tx-info">
                <span className="dashboard__tx-name">Venta Mostrador</span>
                <span className="dashboard__tx-date">Ayer, 11:20 AM</span>
              </div>
              <div className="dashboard__tx-amount">
                <span className="dashboard__tx-value">$890.00</span>
                <span className="dashboard__tx-status">Completado</span>
              </div>
            </div>
            <div className="dashboard__tx">
              <div className="dashboard__tx-icon dashboard__tx-icon--blue">
                <span className="material-symbols-outlined">local_shipping</span>
              </div>
              <div className="dashboard__tx-info">
                <span className="dashboard__tx-name">Logística DHL</span>
                <span className="dashboard__tx-date">24 Sep, 09:30 AM</span>
              </div>
              <div className="dashboard__tx-amount">
                <span className="dashboard__tx-value">$67.50</span>
                <span className="dashboard__tx-status">Completado</span>
              </div>
            </div>
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
