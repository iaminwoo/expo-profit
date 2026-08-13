import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "박람회 수익 계산기",
  description: "박람회 예상 수익을 계산하는 도구",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
