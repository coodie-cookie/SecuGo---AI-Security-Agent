import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { ChatProvider } from "@/components/dashboard/chat-provider";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const email = supabase
    ? (await supabase.auth.getUser()).data.user?.email ?? undefined
    : "abeeranadeem202@gmail.com";

  return (
    <ChatProvider>
      <div className="relative min-h-screen flex bg-background">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col lg:pl-64">
          <Topbar email={email} />
          <main className="flex-1 px-4 md:px-8 py-8 max-w-[1400px] w-full mx-auto">
            {children}
          </main>
          <footer className="px-4 md:px-8 py-3 border-t border-white/[0.04]">
            <p className="text-center text-[11px] text-white/30">
              🔒 SecuGo does not modify your repository or code — all findings are read-only. Please review all suggested changes before applying them.
            </p>
          </footer>
        </div>
      </div>
    </ChatProvider>
  );
}
