import StorageHelper from 'storage-helper-functions';
import dayjs from 'dayjs';

const sh = new StorageHelper(window.sessionStorage);

/**
 * Finds in cache and if not found, executes call
 * @param {string} cacheKey
 * @param {Function} func
 * @param {Validity} [validity]
 * @returns {Promise<any>}
 */
export default async function cacheGetter(cacheKey, func, validity) {
  /**
   * @type {StoredItem}
   */
  const stored = sh.get(cacheKey, 'json');

  const now = dayjs();

  if (stored !== null) {
    if (validity) {
      const maxDate = dayjs(stored.date).add(validity.amount, validity.time);

      if (dayjs() <= maxDate) {
        return stored.data;
      }
    } else {
      return stored.data;
    }
  }

  const data = await func();

  sh.store(cacheKey, {
    date: now.toDate(),
    data,
  }, 'json');

  return data;
}
