import ProtectedShell from "@/components/dashboard/ProtectedShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
