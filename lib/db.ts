import Dexie, { type Table } from "dexie";
import type { FlatMap, TransEditFile } from "./helpers/transedit";

export interface ProjectRow {
	id: string; // same as TransEditFile.id
	meta: TransEditFile["meta"];
	en: FlatMap;
	target: FlatMap;
	updatedAt: string; // ISO
}

export interface SnapshotRow {
	id: string; // uuid
	projectId: string;
	at: string; // ISO
	target: FlatMap;
	note?: string | null;
}

class TransEditDB extends Dexie {
	projects!: Table<ProjectRow, string>;
	snapshots!: Table<SnapshotRow, string>;

	constructor() {
		super("TransEditDB");
		this.version(1).stores({
			projects: "&id, updatedAt",
			snapshots: "&id, projectId, at",
		});
	}
}

let _db: TransEditDB | null = null;

export function getDB() {
	if (!_db) {
		_db = new TransEditDB();
	}
	return _db;
}

export async function upsertProject(row: ProjectRow) {
	const db = getDB();
	await db.projects.put(row);
}

export async function loadProject(id: string): Promise<ProjectRow | undefined> {
	const db = getDB();
	return db.projects.get(id);
}

export async function saveSnapshot(s: SnapshotRow) {
	const db = getDB();
	await db.snapshots.put(s);
}

export async function listSnapshots(projectId: string): Promise<SnapshotRow[]> {
	const db = getDB();
	return db.snapshots
		.where("projectId")
		.equals(projectId)
		.reverse()
		.sortBy("at");
}

export async function deleteProject(id: string) {
	const db = getDB();
	const snaps = await db.snapshots.where("projectId").equals(id).primaryKeys();
	await db.transaction("readwrite", db.projects, db.snapshots, async () => {
		await db.projects.delete(id);
		await db.snapshots.bulkDelete(snaps as string[]);
	});
}

export async function listProjects(): Promise<ProjectRow[]> {
	const db = getDB();
	return db.projects.orderBy("updatedAt").reverse().toArray();
}
