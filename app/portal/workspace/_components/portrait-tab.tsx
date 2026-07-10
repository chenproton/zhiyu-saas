"use client"

export function PortraitTab() {
  return (
    <div className="w-full" style={{ height: 'calc(100vh - 200px)' }}>
      <iframe
        src="/student_portrait.html"
        className="w-full h-full border-0 rounded-md"
        title="学生画像"
      />
    </div>
  )
}
