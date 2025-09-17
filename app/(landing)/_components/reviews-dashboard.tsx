"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listProjects, deleteProject, type ProjectRow } from "@/lib/db";

export function ReviewsDashboard() {
  const [items, setItems] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const all = await listProjects();
    setItems(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onDelete = async (id: string) => {
    await deleteProject(id);
    await refresh();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Your reviews</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet. Import or create one to get started.</p>
        ) : (
          <ul className="divide-y">
            {items.map((p) => (
              <li key={p.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {p.meta.sourceLang} → {p.meta.targetLang}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {p.id}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Updated {new Date(p.updatedAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button asChild variant="outline">
                    <Link href={`/review#${encodeURIComponent(p.id)}`}>Open</Link>
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => onDelete(p.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
