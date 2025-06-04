export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1">
      <main className="container py-6">{children}</main>
    </div>
  );
} 