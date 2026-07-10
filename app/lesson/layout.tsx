export default function LessonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Admin and teacher sub-routes provide their own PlatformShell layouts.
  return <>{children}</>
}
