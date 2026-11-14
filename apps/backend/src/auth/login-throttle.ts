/**
 * Límite anti fuerza bruta para los endpoints de login (tenant y platform), por IP.
 * El global permite 100 req/min; para login es demasiado. Configurable por env
 * (las pruebas E2E hacen muchos logins desde la misma IP).
 */
export const LOGIN_THROTTLE = {
  medium: { limit: Number(process.env.LOGIN_THROTTLE_PER_MIN ?? 5), ttl: 60_000 },
  long: { limit: Number(process.env.LOGIN_THROTTLE_PER_HOUR ?? 20), ttl: 3_600_000 },
};
