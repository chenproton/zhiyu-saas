"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, XCircle, Wallet, Loader2 } from "lucide-react"
import { withdrawalApi, institutionApi, type Withdrawal, type Institution } from "@/lib/api"

export default function AdminWithdrawalsPage() {
  const [activeTab, setActiveTab] = useState("pending")
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [withdrawalRes, institutionRes] = await Promise.all([
        withdrawalApi.list(),
        institutionApi.list(),
      ])
      setWithdrawals(withdrawalRes.items)
      setInstitutions(institutionRes.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载数据失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending")
  const processedWithdrawals = withdrawals.filter((w) => w.status !== "pending")

  const handleAction = (withdrawal: Withdrawal, action: "approve" | "reject") => {
    setSelectedWithdrawal(withdrawal)
    setActionType(action)
  }

  const confirmAction = async () => {
    if (!selectedWithdrawal || !actionType) return
    setActionLoading(true)
    try {
      const nextStatus = actionType === "approve" ? "approved" : "rejected"
      await withdrawalApi.updateStatus(selectedWithdrawal.id, nextStatus)
      await fetchData()
      setSelectedWithdrawal(null)
      setActionType(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败")
    } finally {
      setActionLoading(false)
    }
  }

  const getInstitution = (id: string) => institutions.find((i) => i.id === id)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">提现审核</h1>
          <p className="text-sm text-muted-foreground">审核创作者机构的提现申请</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">待审核</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{pendingWithdrawals.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">待审核金额</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                ¥{pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">累计打款</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                ¥
                {withdrawals
                  .filter((w) => w.status === "paid")
                  .reduce((sum, w) => sum + w.amount, 0)
                  .toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">待审核</TabsTrigger>
            <TabsTrigger value="processed">已处理</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <WithdrawalTable
              withdrawals={pendingWithdrawals}
              institutions={institutions}
              onAction={handleAction}
              showActions
              loading={loading}
            />
          </TabsContent>
          <TabsContent value="processed">
            <WithdrawalTable
              withdrawals={processedWithdrawals}
              institutions={institutions}
              loading={loading}
            />
          </TabsContent>
        </Tabs>

        {/* Action Dialog */}
        <Dialog open={!!selectedWithdrawal} onOpenChange={() => setSelectedWithdrawal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{actionType === "approve" ? "通过提现申请" : "驳回提现申请"}</DialogTitle>
              <DialogDescription>
                申请人：{selectedWithdrawal ? getInstitution(selectedWithdrawal.institutionId)?.name : ""}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="rounded-lg bg-secondary p-4">
                <p className="text-sm text-muted-foreground">提现金额</p>
                <p className="text-2xl font-bold text-foreground">
                  ¥{selectedWithdrawal?.amount.toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  收款账户：{selectedWithdrawal?.accountType === "bank" ? "银行卡" : "支付宝"} {selectedWithdrawal?.accountInfo}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedWithdrawal(null)} disabled={actionLoading}>
                取消
              </Button>
              <Button
                variant={actionType === "approve" ? "default" : "destructive"}
                onClick={confirmAction}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : actionType === "approve" ? (
                  <CheckCircle className="mr-2 h-4 w-4" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                {actionType === "approve" ? "确认通过" : "确认驳回"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

function WithdrawalTable({
  withdrawals,
  institutions,
  onAction,
  showActions,
  loading,
}: {
  withdrawals: Withdrawal[]
  institutions: Institution[]
  onAction?: (w: Withdrawal, action: "approve" | "reject") => void
  showActions?: boolean
  loading?: boolean
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>申请人</TableHead>
              <TableHead>机构</TableHead>
              <TableHead>金额</TableHead>
              <TableHead>账户类型</TableHead>
              <TableHead>申请时间</TableHead>
              <TableHead>状态</TableHead>
              {showActions && <TableHead className="w-10"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.map((w) => {
              const institution = institutions.find((i) => i.id === w.institutionId)
              return (
                <TableRow key={w.id}>
                  <TableCell>{institution?.contactName}</TableCell>
                  <TableCell>{institution?.name}</TableCell>
                  <TableCell className="font-medium">¥{w.amount.toLocaleString()}</TableCell>
                  <TableCell>{w.accountType === "bank" ? "银行卡" : "支付宝"}</TableCell>
                  <TableCell className="text-muted-foreground">{w.createdAt}</TableCell>
                  <TableCell>
                    <WithdrawalStatusBadge status={w.status} />
                  </TableCell>
                  {showActions && onAction && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-success"
                          onClick={() => onAction(w, "approve")}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => onAction(w, "reject")}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {withdrawals.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">暂无数据</div>
        )}
      </CardContent>
    </Card>
  )
}

function WithdrawalStatusBadge({ status }: { status: Withdrawal["status"] }) {
  const map: Record<Withdrawal["status"], { label: string; color: string }> = {
    pending: { label: "待审核", color: "bg-warning/20 text-warning" },
    approved: { label: "审核通过", color: "bg-info/20 text-info" },
    paid: { label: "已打款", color: "bg-success/20 text-success" },
    rejected: { label: "驳回", color: "bg-destructive/20 text-destructive" },
  }
  return <Badge className={map[status].color}>{map[status].label}</Badge>
}
