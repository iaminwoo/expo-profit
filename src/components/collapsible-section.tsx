"use client";

import { useId, useState, type ReactNode } from "react";
import styles from "./collapsible-section.module.css";

type CollapsibleSectionProps = {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  heading?: "h2" | "h3";
  id?: string;
  triggerClassName?: string;
  openContentClassName?: string;
};

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  heading,
  id,
  triggerClassName,
  openContentClassName,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const generatedId = useId();
  const contentId = id ?? generatedId;
  const trigger = (
    <button
      className={`${styles.trigger} ${triggerClassName ?? ""}`}
      type="button"
      onClick={() => setIsOpen((current) => !current)}
      aria-expanded={isOpen}
      aria-controls={contentId}
    >
      <span>{title}</span>
      <span className={isOpen ? styles.arrowOpen : styles.arrow}>▾</span>
    </button>
  );

  return (
    <>
      {heading === "h2" ? <h2>{trigger}</h2> : heading === "h3" ? <h3>{trigger}</h3> : trigger}
      <div
        id={contentId}
        className={`${styles.content} ${isOpen ? `${styles.contentOpen} ${openContentClassName ?? ""}` : ""}`}
        inert={!isOpen}
      >
        <div className={styles.inner}>{children}</div>
      </div>
    </>
  );
}
