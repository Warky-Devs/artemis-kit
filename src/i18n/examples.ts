
/**
 * Example usage:
 * ```typescript
 * import { i18n, t, tt } from './i18n';
 * 
 * // Configure once at app startup
 * i18n.configure({
 *     apiUrl: 'https://api.example.com/translations'
 * });
 * 
 * // Sync usage
 * const message = t('welcome_message', 'Welcome');
 * 
 * // Async usage
 * const asyncMessage = await tt('welcome_message', 'Welcome');
 * 
 * // Listen for updates
 * window.addEventListener('i18n-updated', (event) => {
 *     const { id, value } = event.detail;
 *     // Update UI with new translation
 * });
 * ```
 */