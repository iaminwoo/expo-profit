import { FloatingHomeButton } from "@/components/floating-home-button";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "박람회 수익관리 | 행사 매출·비용·수익 분석",
  description:
    "박람회 일정과 예상 비용을 계획하고, 일일 매출과 실제 비용을 기록해 행사별 수익성을 확인할 수 있습니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>
        {children}
        <FloatingHomeButton />
      </body>
    </html>
  );
}
