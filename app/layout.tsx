import type { Metadata } from "next";
import "./globals.css";
import { START_ROOM } from "./rooms";

export const metadata: Metadata = {
  title: "Lighthouse, by Beerow",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body data-room={START_ROOM.art}>{children}</body>
    </html>
  );
}
