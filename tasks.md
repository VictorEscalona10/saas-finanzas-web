# Tasks — saas-finanzas-web

## Estado general

| Área | Estado |
|------|--------|
| Auth (Supabase SSR) | ✅ Completo |
| Companies (CRUD) | ✅ Completo |
| Categories (CRUD) | ✅ Completo |
| Items (CRUD) | ✅ Completo |
| Transactions (CRUD + batch) | ✅ Completo |
| Production Batches | ✅ Completo |
| Cash Flow | 🟡 Pendiente (solo interface) |
| Contribution Margin | 🟡 Pendiente (solo interface) |
| Gross Profit | 🟡 Pendiente (solo interface) |
| Net Profit / P&L | 🟡 Pendiente (solo interface) |
| Unit Cost | 🟡 Pendiente (solo interface) |
| Price Margin | 🟡 Pendiente (solo interface) |
| Balance Point | 🟡 Pendiente (solo interface) |
| Dashboard | ✅ Completo |
| Finance Chat | 🟡 Pendiente (solo interface) |
| Dollar Rate | ✅ Completo |

## Pendientes

- [x] `ProductionBatchRepositoryImpl` ✅
- [x] `CashFlowRepositoryImpl` ✅
- [x] `CashFlowSummary` component ✅
- [x] `CashFlowStatement` component ✅
- [x] `CashFlowChart` component ✅
- [x] `CashFlowScreen` + route page ✅
- [ ] Implementar `ContributionMarginRepositoryImpl` y demás repos faltantes
- [ ] Conectar las pantallas de Cash Flow, Contribution Margin, etc. con datos reales
- [ ] Implementar Finance Chat
- [ ] Tests unitarios (ningún framework configurado aún)
- [ ] Manejo de errores consistente en todas las pantallas
- [ ] Responsive refinado en módulos nuevos
