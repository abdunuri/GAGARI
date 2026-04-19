import ProtectedShell from "@/components/dashboard/ProtectedShell";

export default async function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedShell>{children}</ProtectedShell>;
}