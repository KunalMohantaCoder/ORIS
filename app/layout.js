import "./globals.css";
import AppShell from "../components/layout/AppShell";

export const metadata = {
  title: "ORIS - Orbital Risk Intelligence System",
  description: "A scientific orbital intelligence platform for debris, collision risk, and space sustainability analysis."
};

export default function RootLayout({ children }) {
  return (
    <html data-scroll-behavior="smooth" lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
