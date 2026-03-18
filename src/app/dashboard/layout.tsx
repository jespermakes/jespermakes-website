export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#0f0f0f] min-h-screen -my-px">
      {children}
    </div>
  );
}
