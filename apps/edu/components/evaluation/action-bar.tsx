'use client'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Save, Send, X, Upload, UserPlus, Ban } from 'lucide-react'
import { type RuleStatus } from '@/lib/types'

interface ActionBarProps {
  status: RuleStatus
  onSaveDraft: () => void
  onSubmitReview: () => void
  onCancelReview: () => void
  onPublish: () => void
  onCancelPublish: () => void
  onInviteCollaborate: () => void
  hasValidationErrors: boolean
}

// 根据状态返回可见按钮
function getVisibleActions(status: RuleStatus) {
  switch (status) {
    case 'draft':
    case 'not_submitted':
      return ['saveDraft', 'submitReview', 'inviteCollaborate']
    case 'reviewing':
      return ['cancelReview']
    case 'rejected':
      return ['saveDraft', 'submitReview']
    case 'ready':
      return ['saveDraft', 'submitReview', 'publish']
    case 'published':
      return ['saveDraft', 'submitReview', 'cancelPublish']
    case 'none':
      return ['saveDraft', 'submitReview']
    default:
      return []
  }
}

export function ActionBar({
  status,
  onSaveDraft,
  onSubmitReview,
  onCancelReview,
  onPublish,
  onCancelPublish,
  onInviteCollaborate,
  hasValidationErrors,
}: ActionBarProps) {
  const visibleActions = getVisibleActions(status)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-5xl items-center justify-end gap-3 px-6 py-4">
        {/* 保存草稿 */}
        {visibleActions.includes('saveDraft') && (
          <Button variant="outline" onClick={onSaveDraft}>
            <Save className="mr-2 size-4" />
            保存草稿
          </Button>
        )}

        {/* 邀请共建 */}
        {visibleActions.includes('inviteCollaborate') && (
          <Button variant="outline" onClick={onInviteCollaborate}>
            <UserPlus className="mr-2 size-4" />
            邀请共建
          </Button>
        )}

        {/* 取消审批 */}
        {visibleActions.includes('cancelReview') && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <X className="mr-2 size-4" />
                取消审批
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确定取消审批？</AlertDialogTitle>
                <AlertDialogDescription>
                  取消后规则将回到草稿状态，所有共建人均可继续编辑。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>返回</AlertDialogCancel>
                <AlertDialogAction onClick={onCancelReview}>
                  确定取消
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* 取消发布 */}
        {visibleActions.includes('cancelPublish') && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive">
                <Ban className="mr-2 size-4" />
                取消发布
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确定取消发布？</AlertDialogTitle>
                <AlertDialogDescription>
                  该岗位能力认证将变为无规则状态，立即生效。当前配置将保留为草稿。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>返回</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onCancelPublish}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  确定取消发布
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* 提交审批 */}
        {visibleActions.includes('submitReview') && (
          <Button
            onClick={onSubmitReview}
            disabled={hasValidationErrors}
            variant="secondary"
          >
            <Send className="mr-2 size-4" />
            提交审批
          </Button>
        )}

        {/* 发布 */}
        {visibleActions.includes('publish') && (
          <Button onClick={onPublish}>
            <Upload className="mr-2 size-4" />
            发布
          </Button>
        )}
      </div>
    </div>
  )
}
