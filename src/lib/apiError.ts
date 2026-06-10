/**
 * Extrait un message lisible depuis une erreur API ou réseau.
 */
export function getApiErrorMessage(err: unknown, fallback = 'Une erreur est survenue'): string {
  if (!(err instanceof Error) || !err.message) {
    return fallback;
  }

  const msg = err.message.trim();

  if (/401|unauthorized/i.test(msg)) {
    return 'Session expirée. Veuillez vous reconnecter.';
  }
  if (/403|forbidden/i.test(msg)) {
    return 'Action non autorisée pour votre rôle.';
  }
  if (/404|not found/i.test(msg)) {
    return 'Ressource introuvable.';
  }
  if (/500|502|503|internal server/i.test(msg)) {
    return 'Le serveur est indisponible. Réessayez dans quelques instants.';
  }
  if (/network|failed to fetch|fetch failed/i.test(msg)) {
    return 'Connexion impossible. Vérifiez votre réseau.';
  }

  return msg;
}
