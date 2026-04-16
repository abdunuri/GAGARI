import ProtectedShell from "@/components/dashboard/ProtectedShell";

export default async function CustomersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
