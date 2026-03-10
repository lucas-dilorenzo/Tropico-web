export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <nav className="border-b p-4">
        <span className="font-bold">Trópico</span>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
