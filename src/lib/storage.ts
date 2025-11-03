function isClient() {
  return typeof window !== 'undefined';
}

export function setItem<T>(key: string, value: T) {
  if (!isClient()) return;
  try {
    const valueToStore = JSON.stringify(value);
    if (window.storage && typeof window.storage.set === 'function') {
      window.storage.set(key, valueToStore);
    } else {
      window.localStorage.setItem(key, valueToStore);
    }
  } catch (error) {
    console.error(`Error setting item ${key} in storage:`, error);
  }
}

export function getItem<T>(key: string, defaultValue: T): T {
  if (!isClient()) return defaultValue;
  try {
    let item: string | null = null;
    if (window.storage && typeof window.storage.get === 'function') {
      item = window.storage.get(key);
    } else {
      item = window.localStorage.getItem(key);
    }
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting item ${key} from storage:`, error);
    return defaultValue;
  }
}
