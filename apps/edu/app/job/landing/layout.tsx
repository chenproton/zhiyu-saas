"use client"

export default function JobLandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div style={{ background: "#f5f7fa", color: "#333", fontFamily: '"Microsoft YaHei", Arial, sans-serif', minHeight: "100vh" }}>
      {children}
    </div>
  )
}
