import { useState, useCallback } from "react";
import {
  shareObjective as apiShareObjective,
  getSharedObjective as apiGetSharedObjective,
  type SharedObjectiveWithItems,
  type SharedPermissionLevel,
} from "@/lib/supabaseClient";
import type { Objective, MemoryItem } from "@/types";
import {
  loadObjectives,
  saveObjectives,
  loadCustomItems,
  saveCustomItems,
} from "@/data/objectives";
import { useAppMode } from "@/hooks/useAppMode";

const IMPORTED_SHARED_KEY = "memorize-imported-shared-objectives";

export interface ImportedSharedObjective {
  shareCode: string;
  name: string;
  description: string | null;
  ownerName: string;
  permissionLevel: SharedPermissionLevel;
  importedAt: string;
  objectiveId?: string; // If copied to local, this is the local objective ID
}

export function useSharedObjectives() {
  const { userName } = useAppMode();
  const [importedObjectives, setImportedObjectives] = useState<ImportedSharedObjective[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem(IMPORTED_SHARED_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveImportedObjectives = useCallback((objectives: ImportedSharedObjective[]) => {
    setImportedObjectives(objectives);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(IMPORTED_SHARED_KEY, JSON.stringify(objectives));
    }
  }, []);

  const shareObjective = useCallback(
    async (
      objective: Objective,
      items: MemoryItem[],
      permissionLevel: SharedPermissionLevel = "allow_copy",
    ): Promise<{ shareCode: string; error: Error | null }> => {
      const itemsData = items.map((item) => ({
        title: item.title,
        book: item.book,
        chapter: item.chapter,
        verse: item.verse,
        text: item.text,
      }));

      const result = await apiShareObjective(
        objective.name,
        objective.description ?? null,
        itemsData,
        userName || "Anônimo",
        permissionLevel,
      );

      return result;
    },
    [userName],
  );

  const importSharedObjective = useCallback(
    async (
      shareCode: string,
      copyToLibrary: boolean = true,
    ): Promise<{
      data: SharedObjectiveWithItems | null;
      error: Error | null;
      objectiveId?: string;
    }> => {
      const result = await apiGetSharedObjective(shareCode);

      if (result.error || !result.data) {
        return { data: null, error: result.error };
      }

      const sharedData = result.data;

      // Add to imported list
      const imported: ImportedSharedObjective = {
        shareCode: sharedData.share_code,
        name: sharedData.name,
        description: sharedData.description,
        ownerName: sharedData.owner_name,
        permissionLevel: sharedData.permission_level,
        importedAt: new Date().toISOString(),
      };

      let objectiveId: string | undefined;

      if (copyToLibrary) {
        // Copy to local objectives
        const objectives = loadObjectives();
        const now = new Date().toISOString();

        const newObjective: Objective = {
          id: `obj-${Date.now()}`,
          name: `${sharedData.name} (importado)`,
          description: sharedData.description ?? undefined,
          itemIds: [],
          lastStudiedAt: undefined,
          createdAt: now,
        };

        let customItems = loadCustomItems();

        // Add each item
        const newItemIds: string[] = [];
        for (const item of sharedData.items) {
          const newItemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const newItem: MemoryItem = {
            id: newItemId,
            title: item.title,
            book: item.book,
            chapter: item.chapter,
            verse: item.verse,
            text: item.text,
            category: item.category,
            tags: item.tags,
            createdAt: now,
            reviewCount: 0,
            mastery: 0,
          };
          customItems = [newItem, ...customItems];
          newItemIds.push(newItemId);
        }

        newObjective.itemIds = newItemIds;
        saveObjectives([newObjective, ...objectives]);
        saveCustomItems(customItems);

        imported.objectiveId = newObjective.id;
        objectiveId = newObjective.id;
      }

      // Check if already imported
      const existingIndex = importedObjectives.findIndex(
        (o) => o.shareCode === sharedData.share_code,
      );
      if (existingIndex >= 0) {
        const updated = [...importedObjectives];
        updated[existingIndex] = imported;
        saveImportedObjectives(updated);
      } else {
        saveImportedObjectives([imported, ...importedObjectives]);
      }

      return { data: sharedData, error: null, objectiveId };
    },
    [importedObjectives, saveImportedObjectives],
  );

  const removeImportedObjective = useCallback(
    (shareCode: string) => {
      const updated = importedObjectives.filter((o) => o.shareCode !== shareCode);
      saveImportedObjectives(updated);
    },
    [importedObjectives, saveImportedObjectives],
  );

  return {
    importedObjectives,
    shareObjective,
    importSharedObjective,
    removeImportedObjective,
  };
}
