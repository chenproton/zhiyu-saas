import { TopNav } from "@/components/portal/top-nav"
import { AuthProvider } from "@/contexts/auth-context"
import { YiKnowAssistant } from "@/components/portal/yi-know-assistant"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen pt-14">
        <TopNav />
        <main>
          {children}
        </main>
        <YiKnowAssistant />
      </div>
    </AuthProvider>
  )
}
