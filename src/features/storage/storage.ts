import type { EditorOptions } from '../../editor/structs';

export type SavedPad = {
	id: string;
	description: string;
	savedAt: string;
	editors: {
		code: string;
		opts: EditorOptions;
	}[];
};

const DB_NAME = 'PadStorage';
const DB_VERSION = 1;
const STORE_NAME = 'pads';

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
	return new Promise((resolve, reject) => {
		if (db) {
			resolve(db);
			return;
		}

		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => {
			db = request.result;
			resolve(db);
		};

		request.onupgradeneeded = (event) => {
			db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				const store = db.createObjectStore(STORE_NAME, {
					keyPath: 'id',
				});
				store.createIndex('savedAt', 'savedAt', { unique: false });
			}
		};
	});
};

export const generatePadId = (): string => {
	return `pad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const savePad = async (
	id: string,
	pad: Omit<SavedPad, 'id' | 'savedAt'>
): Promise<void> => {
	const database = await initDB();
	const savedAt = new Date().toISOString();

	// Filter out empty editors
	const nonEmptyEditors = pad.editors.filter(
		(editor) =>
			editor.code.trim() !== '' || editor.opts.filename?.trim() !== ''
	);

	// If no non-empty editors and no description, delete the pad
	if (nonEmptyEditors.length === 0 && pad.description.trim() === '') {
		await deletePad(id);
		return;
	}

	const savedPad: SavedPad = {
		id,
		savedAt,
		description: pad.description,
		editors: nonEmptyEditors,
	};

	return new Promise((resolve, reject) => {
		const transaction = database.transaction([STORE_NAME], 'readwrite');
		const store = transaction.objectStore(STORE_NAME);
		const request = store.put(savedPad);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve();
	});
};

export const loadPad = async (id: string): Promise<SavedPad | null> => {
	const database = await initDB();

	return new Promise((resolve, reject) => {
		const transaction = database.transaction([STORE_NAME], 'readonly');
		const store = transaction.objectStore(STORE_NAME);
		const request = store.get(id);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result || null);
	});
};

export const listPads = async (): Promise<SavedPad[]> => {
	const database = await initDB();

	return new Promise((resolve, reject) => {
		const transaction = database.transaction([STORE_NAME], 'readonly');
		const store = transaction.objectStore(STORE_NAME);
		const index = store.index('savedAt');
		const request = index.getAll();

		request.onerror = () => reject(request.error);
		request.onsuccess = () => {
			// Sort by savedAt descending (newest first)
			const pads = request.result.sort(
				(a, b) =>
					new Date(b.savedAt).getTime() -
					new Date(a.savedAt).getTime()
			);
			resolve(pads);
		};
	});
};

export const deletePad = async (id: string): Promise<void> => {
	const database = await initDB();

	return new Promise((resolve, reject) => {
		const transaction = database.transaction([STORE_NAME], 'readwrite');
		const store = transaction.objectStore(STORE_NAME);
		const request = store.delete(id);

		request.onerror = () => {
			// Ignore error if pad doesn't exist
			if (request.error?.name === 'NotFoundError') {
				resolve();
			} else {
				reject(request.error);
			}
		};
		request.onsuccess = () => resolve();
	});
};
