import ProtectedShell from "@/components/dashboard/ProtectedShell";

export default async function ItemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
