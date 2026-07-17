import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "QleanFlow Quantum — Water Risk Intelligence",
    template: "%s · QleanFlow Quantum",
  },
  description:
    "Quantum-enhanced water contamination risk assessment for communities affected by illegal mining in Ghana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
