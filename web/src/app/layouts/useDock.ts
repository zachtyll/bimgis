import { ref, watch, type Ref } from 'vue';

export interface DockState {
  width: Ref<number>;
  collapsed: Ref<boolean>;
}

interface StoredDock {
  width: number;
  collapsed: boolean;
}

/**
 * Width and collapsed state of a side dock, remembered per browser. Storage can be
 * unavailable (private mode, blocked site data), so every access is guarded and the
 * defaults always work.
 */
export function useDock(storageKey: string, defaultWidth: number): DockState {
  const stored = read(storageKey);
  const width = ref(stored?.width ?? defaultWidth);
  const collapsed = ref(stored?.collapsed ?? false);

  watch([width, collapsed], () => write(storageKey, { width: width.value, collapsed: collapsed.value }));

  return { width, collapsed };
}

function read(key: string): StoredDock | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<StoredDock>;
    return typeof value.width === 'number' && typeof value.collapsed === 'boolean'
      ? { width: value.width, collapsed: value.collapsed }
      : null;
  } catch {
    return null;
  }
}

function write(key: string, value: StoredDock): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Not persisted; the dock still works for this session.
  }
}
