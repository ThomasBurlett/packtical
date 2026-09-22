export type User = { uid: string; name: string; email: string };
export type RecordData = Record<string, unknown>;
export type Entry = { id: string; data: RecordData };
export type Write = { path: string; data?: RecordData; remove?: boolean };
export type Meta = { pending: boolean; cached: boolean };
export interface Driver {
  preview: boolean;
  auth(next: (user: User | null) => void): () => void;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
  watch(
    path: string,
    list: boolean,
    next: (entries: Entry[], meta: Meta) => void,
    fail: (error: Error) => void,
  ): () => void;
  write(writes: Write[]): Promise<void>;
}
