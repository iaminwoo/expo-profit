import { formatDateRange } from "@/lib/format";
import type { ScheduleRecord } from "@/lib/models";
import styles from "@/app/calculator/page.module.css";

type Props = { schedules: ScheduleRecord[]; onClose: () => void; onSelect: (schedule: ScheduleRecord) => void };

export function SchedulePickerModal({ schedules, onClose, onSelect }: Props) {
  return (
    <div className={styles.modalBackdrop} role="presentation" onMouseDown={onClose}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="schedule-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 id="schedule-modal-title">박람회 일정 선택</h2>
          <button type="button" className={styles.modalClose} onClick={onClose} aria-label="닫기">×</button>
        </div>
        {schedules.length ? <div className={styles.scheduleList}>
          {schedules.map((schedule) => <button className={styles.scheduleOption} type="button" key={schedule.id} onClick={() => onSelect(schedule)}>
            <strong>{schedule.expoName || "이름 없는 행사"}</strong>
            <span>{formatDateRange(schedule.startDate, schedule.endDate)}</span>
            <span>{schedule.location || "장소 미입력"}</span>
          </button>)}
        </div> : <p className={styles.modalEmpty}>저장된 일정이 없습니다. 일정 생성에서 먼저 행사를 등록해 주세요.</p>}
      </section>
    </div>
  );
}
