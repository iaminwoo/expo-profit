"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { defaultCostItems, getCostItems, saveCostItems } from "@/lib/cost-item-storage";
import { useHydratedState } from "@/hooks/use-hydrated-state";
import { createId } from "@/lib/local-storage";
import type { CostItem } from "@/lib/models";
import styles from "./page.module.css";

export default function CostItemsPage() {
  const router = useRouter();
  const { value: items, setValue: setItems, isHydrated } = useHydratedState<CostItem[]>(defaultCostItems, getCostItems);
  const [newItemName, setNewItemName] = useState("");
  const [saveError, setSaveError] = useState("");
  const itemElements = useRef(new Map<string, HTMLDivElement>());
  const previousPositions = useRef(new Map<string, number>());

  useLayoutEffect(() => {
    if (!previousPositions.current.size) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    itemElements.current.forEach((element, id) => {
      const previousTop = previousPositions.current.get(id);
      if (previousTop === undefined) return;

      const distance = previousTop - element.getBoundingClientRect().top;
      if (distance && !reduceMotion) {
        element.animate(
          [
            { transform: `translateY(${distance}px)` },
            { transform: "translateY(0)" },
          ],
          { duration: 220, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
        );
      }
    });
    previousPositions.current.clear();
  }, [items]);

  function updateItems(nextItems: CostItem[]) {
    setItems(nextItems);
    setSaveError("");
  }

  function addItem() {
    const name = newItemName.trim();
    if (!name) return;

    updateItems([...items, { id: createId(), name }]);
    setNewItemName("");
  }

  function removeItem(id: string) {
    updateItems(items.filter((item) => item.id !== id));
  }

  function moveItem(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;

    previousPositions.current = new Map(
      Array.from(itemElements.current, ([id, element]) => [id, element.getBoundingClientRect().top]),
    );
    const nextItems = [...items];
    [nextItems[index], nextItems[nextIndex]] = [nextItems[nextIndex], nextItems[index]];
    updateItems(nextItems);
  }

  function handleSave() {
    if (!saveCostItems(items)) {
      setSaveError("저장하지 못했습니다. 브라우저 저장 공간을 확인한 뒤 다시 시도해주세요.");
      return;
    }

    setSaveError("");
    router.push("/");
  }

  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>EXPO SETTINGS</p>
          <h1>비용 항목 관리</h1>
          <p>수익성 계산기에 표시할 비용 항목과 순서를 관리하세요.</p>
        </header>

        <section className={styles.card}>
          <div className={styles.addItem}>
            <label htmlFor="new-cost-item">새 비용 항목</label>
            <div className={styles.addRow}>
              <input
                id="new-cost-item"
                type="text"
                value={newItemName}
                onChange={(event) => setNewItemName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addItem();
                }}
                placeholder="예: 광고비"
              />
              <button type="button" onClick={addItem}>추가</button>
            </div>
          </div>

          {isHydrated && <div className={styles.list}>
            {items.map((item, index) => (
              <div
                className={styles.item}
                key={item.id}
                ref={(element) => {
                  if (element) itemElements.current.set(item.id, element);
                  else itemElements.current.delete(item.id);
                }}
              >
                <span>{item.name}</span>
                <div className={styles.itemActions}>
                  <button type="button" onClick={() => moveItem(index, -1)} disabled={index === 0} aria-label={`${item.name} 위로 이동`}>↑</button>
                  <button type="button" onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} aria-label={`${item.name} 아래로 이동`}>↓</button>
                  <button className={styles.deleteButton} type="button" onClick={() => removeItem(item.id)}>삭제</button>
                </div>
              </div>
            ))}
            {!items.length && <p className={styles.empty}>표시할 비용 항목이 없습니다.</p>}
          </div>}
        </section>
        <button className={styles.saveButton} type="button" onClick={handleSave}>저장하기</button>
        {saveError && <p className={styles.saveError} role="alert">{saveError}</p>}
      </section>
    </main>
  );
}
