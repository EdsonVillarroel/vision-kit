## Qué cambia

<!-- Resumen breve del cambio y por qué -->

## Migraciones de base de datos

> Render despliega el backend apenas se mergea a `main`. Si el código usa una columna o un valor
> de enum que todavía no existe en Supabase, producción responde 500 hasta aplicar la migración.

- [ ] Este PR **no** agrega archivos en `supabase/migrations/`
- [ ] Este PR agrega migraciones y **ya están aplicadas en Supabase** antes de mergear:
      `psql "$DIRECT_URL" -f supabase/migrations/<archivo>.sql`

## Configuración de herramientas

> Un hook o tarea automática en estas carpetas ejecuta código al abrir el repo (así entró el malware de `a2a8cb7`).

- [ ] Este PR **no** modifica `.claude/`, `.vscode/`, `.cursor/`, `.gemini/`, `.github/` ni scripts de `package.json`
- [ ] Los modifica y revisé línea por línea qué ejecutan

## Verificación

- [ ] `npm run lint` y `npm run build` de las apps afectadas
- [ ] `npm test` (unitarios backend + frontend)
- [ ] `npm run test:e2e` si toca flujos de venta, login o usuarios
- [ ] Probado en el navegador el flujo afectado
