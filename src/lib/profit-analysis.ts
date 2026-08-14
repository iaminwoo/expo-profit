import { calculateProfitRate } from "./calculations";
import { formatPercentage } from "./format";

type ProfitAnalysisInput = {
  targetSales: number;
  expectedCosts: number;
  actualSales: number;
  actualCosts: number;
};

export type ProfitAnalysis = {
  targetSales: number;
  expectedCosts: number;
  expectedProfit: number;
  actualSales: number;
  actualCosts: number;
  actualProfit: number;
  salesAchievementRate: number | null;
  salesDifference: number;
  profitAchievementRate: number | null;
  profitDifference: number;
  costExecutionRate: number | null;
  costDifference: number;
  actualProfitMargin: number | null;
  expectedProfitMargin: number | null;
  actualReturnOnCost: number | null;
  expectedReturnOnCost: number | null;
  profitMarginDifference: number | null;
  returnOnCostDifference: number | null;
  breakEvenSales: number;
  breakEvenDifference: number;
};

export function createProfitAnalysis({
  targetSales,
  expectedCosts,
  actualSales,
  actualCosts,
}: ProfitAnalysisInput): ProfitAnalysis {
  const expectedProfit = targetSales - expectedCosts;
  const actualProfit = actualSales - actualCosts;
  const actualProfitMargin = calculateProfitRate(actualProfit, actualSales);
  const expectedProfitMargin = calculateProfitRate(expectedProfit, targetSales);
  const actualReturnOnCost = calculateProfitRate(actualProfit, actualCosts);
  const expectedReturnOnCost = calculateProfitRate(expectedProfit, expectedCosts);

  return {
    targetSales,
    expectedCosts,
    expectedProfit,
    actualSales,
    actualCosts,
    actualProfit,
    salesAchievementRate: calculateProfitRate(actualSales, targetSales),
    salesDifference: actualSales - targetSales,
    profitAchievementRate: calculateProfitRate(actualProfit, expectedProfit),
    profitDifference: actualProfit - expectedProfit,
    costExecutionRate: calculateProfitRate(actualCosts, expectedCosts),
    costDifference: actualCosts - expectedCosts,
    actualProfitMargin,
    expectedProfitMargin,
    actualReturnOnCost,
    expectedReturnOnCost,
    profitMarginDifference:
      actualProfitMargin === null || expectedProfitMargin === null
        ? null
        : actualProfitMargin - expectedProfitMargin,
    returnOnCostDifference:
      actualReturnOnCost === null || expectedReturnOnCost === null
        ? null
        : actualReturnOnCost - expectedReturnOnCost,
    breakEvenSales: expectedCosts,
    breakEvenDifference: actualSales - expectedCosts,
  };
}

export function getProfitAnalysisSummary(analysis: ProfitAnalysis) {
  const hasTargets = analysis.targetSales > 0 || analysis.expectedCosts > 0;
  if (!hasTargets) {
    return "목표 매출과 예상 비용을 설정하면 실제 결과와 비교한 분석을 확인할 수 있습니다.";
  }

  const salesSummary = analysis.salesAchievementRate === null
    ? "매출 목표가 설정되지 않았습니다"
    : `매출은 목표의 ${formatPercentage(analysis.salesAchievementRate)}를 달성했습니다`;

  const costSummary = analysis.costExecutionRate === null
    ? "예상 비용이 설정되지 않았습니다"
    : analysis.costDifference < 0
      ? `비용은 예상보다 ${formatPercentage(-analysis.costDifference / analysis.expectedCosts * 100)} 적게 사용했습니다`
      : analysis.costDifference > 0
        ? `비용은 예상보다 ${formatPercentage(analysis.costDifference / analysis.expectedCosts * 100)} 많이 사용했습니다`
        : "비용은 예상과 같습니다";

  const profitSummary = analysis.profitAchievementRate === null
    ? "예상 이익이 0원이라 이익 목표 달성률은 계산할 수 없습니다"
    : `이익은 예상의 ${formatPercentage(analysis.profitAchievementRate)}를 달성했습니다`;

  return `${salesSummary}. ${costSummary}, ${profitSummary}.`;
}
