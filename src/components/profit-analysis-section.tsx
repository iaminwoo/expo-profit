import { CollapsibleSection } from "@/components/collapsible-section";
import { formatPercentage, formatWon } from "@/lib/format";
import {
  getProfitAnalysisSummary,
  type ProfitAnalysis,
} from "@/lib/profit-analysis";
import styles from "./profit-analysis-section.module.css";

type Props = {
  analysis: ProfitAnalysis;
};

function formatDifference(value: number) {
  return `${value > 0 ? "+" : ""}${formatWon(value)}`;
}

function formatPercentagePointDifference(value: number | null) {
  if (value === null) return "-";

  return `${value > 0 ? "+" : ""}${formatPercentage(value)}p`;
}

function costDifferenceLabel(value: number) {
  if (value < 0) return `절감 ${formatWon(-value)}`;
  if (value > 0) return `초과 ${formatWon(value)}`;

  return "예상과 같음";
}

function breakEvenDifferenceLabel(value: number) {
  if (value < 0) return `부족 ${formatWon(-value)}`;
  if (value > 0) return `초과 ${formatWon(value)}`;

  return "손익분기 달성";
}

function AnalysisRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.row}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function ProfitAnalysisSection({ analysis }: Props) {
  return (
    <section className={styles.analysis}>
      <CollapsibleSection id="profit-analysis" title="분석" heading="h2">
        <p className={styles.summary}>{getProfitAnalysisSummary(analysis)}</p>

        <section className={styles.group}>
          <h3>목표 달성</h3>
          <dl>
            <AnalysisRow label="매출 목표 달성률" value={formatPercentage(analysis.salesAchievementRate)} />
            <AnalysisRow label="목표 대비 매출 차이" value={formatDifference(analysis.salesDifference)} />
            <AnalysisRow label="이익 목표 달성률" value={formatPercentage(analysis.profitAchievementRate)} />
            <AnalysisRow label="목표 대비 이익 차이" value={formatDifference(analysis.profitDifference)} />
          </dl>
        </section>

        <section className={styles.group}>
          <h3>비용 관리</h3>
          <dl>
            <AnalysisRow label="비용 집행률" value={formatPercentage(analysis.costExecutionRate)} />
            <AnalysisRow label="예상 대비 비용 차이" value={costDifferenceLabel(analysis.costDifference)} />
          </dl>
        </section>

        <section className={styles.group}>
          <h3>수익성</h3>
          <dl>
            <AnalysisRow label="예상 매출이익률" value={formatPercentage(analysis.expectedProfitMargin)} />
            <AnalysisRow label="실제 매출이익률" value={formatPercentage(analysis.actualProfitMargin)} />
            <AnalysisRow label="매출이익률 차이" value={formatPercentagePointDifference(analysis.profitMarginDifference)} />
            <AnalysisRow label="예상 비용 대비 수익률" value={formatPercentage(analysis.expectedReturnOnCost)} />
            <AnalysisRow label="실제 비용 대비 수익률" value={formatPercentage(analysis.actualReturnOnCost)} />
            <AnalysisRow label="비용 대비 수익률 차이" value={formatPercentagePointDifference(analysis.returnOnCostDifference)} />
          </dl>
        </section>

        <section className={styles.group}>
          <h3>손익분기</h3>
          <dl>
            <AnalysisRow label="예상 손익분기 매출" value={formatWon(analysis.breakEvenSales)} />
            <AnalysisRow label="손익분기 여유금액" value={breakEvenDifferenceLabel(analysis.breakEvenDifference)} />
          </dl>
        </section>
      </CollapsibleSection>
    </section>
  );
}
