import ProtectedShell from "@/components/dashboard/ProtectedShell";



export default async function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
