// Wraps localStorage/sessionStorage so a blocked storage context (private
// browsing, embedded preview frames, tracking prevention, etc. — seen in
// production as "Access to storage is not allowed from this context") can't
// throw and crash whatever call site touched it. Falls back to acting empty.
function makeSafeStorage(storage: () => Storage) {
  return {
    getItem(key: string): string | null {
      try {
        return storage().getItem(key);
      } catch {
        return null;
      }
    },
    setItem(key: string, value: string): void {
      try {
        storage().setItem(key, value);
      } catch {
        // Ignored — caller keeps working off in-memory state.
      }
    },
    removeItem(key: string): void {
      try {
        storage().removeItem(key);
      } catch {
        // Ignored.
      }
    },
  };
}

export const safeLocalStorage = makeSafeStorage(() => localStorage);
export const safeSessionStorage = makeSafeStorage(() => sessionStorage);
