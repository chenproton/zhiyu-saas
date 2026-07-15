"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface StudentPortraitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentName?: string
  className?: string
  positionId?: string
  department?: string
  major?: string
  grade?: string
}

export function StudentPortraitModal({
  open,
  onOpenChange,
}: StudentPortraitModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[95vw] !max-w-none !p-0 !gap-0 overflow-hidden" style={{ height: '92vh' }}>
        <DialogHeader className="px-6 pt-4 pb-2 shrink-0">
          <DialogTitle className="text-lg">学生能力画像详情</DialogTitle>
        </DialogHeader>
        <div className="w-full" style={{ height: 'calc(92vh - 60px)' }}>
          <iframe
            src="/student_portrait.html"
            className="w-full h-full border-0"
            title="学生能力画像"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
