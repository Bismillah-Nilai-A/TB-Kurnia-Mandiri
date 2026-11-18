import ProtectedLayoutView from "@/components/layout/ProtectedLayoutView";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayoutView>{children}</ProtectedLayoutView>;
}
