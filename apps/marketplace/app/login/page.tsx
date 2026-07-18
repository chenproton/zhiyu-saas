"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, ShoppingBag, User, Lock, MessageCircle, QrCode } from "lucide-react"
import { authApi, setToken, removeToken, getEduBaseUrl } from "@/lib/api"
import { useAuth } from "@/components/auth-provider"

function getPostLoginPath(identityCode?: string): string | null {
  switch (identityCode) {
    case "platform_admin":
      return "/admin"
    case "school_admin":
    case "enterprise_mentor":
      return "/dashboard"
    case "teacher":
    case "student":
      return null
    default:
      return "/"
  }
}

type LoginMethod = "password" | "sms" | "wechat"

const methodTabs: { key: LoginMethod; label: string; icon: typeof MessageCircle }[] = [
  { key: "password", label: "账号密码", icon: Lock },
  { key: "sms", label: "短信登录", icon: MessageCircle },
  { key: "wechat", label: "微信扫码", icon: QrCode },
]

export default function LoginPage() {
  const router = useRouter()
  const { refresh } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loginMethod !== "password") return
    setError("")
    setLoading(true)

    try {
      const res = await authApi.saasLogin({ username, password })
      setToken(res.token, "saas")
      await refresh()
      const me = await authApi.saasMe()
      const roleCodes = (me.roles || []).map((r) => r.code)
      const primaryCode = ["platform_admin", "school_admin", "enterprise_mentor", "teacher", "student"].find((c) => roleCodes.includes(c)) || roleCodes[0]
      const nextPath = getPostLoginPath(primaryCode)
      if (nextPath === null) {
        removeToken("saas")
        setError(`教师和学生账号请访问教育管理平台登录：${getEduBaseUrl()}/portal/login`)
        setLoading(false)
        return
      }
      router.replace(nextPath)
    } catch (err: any) {
      setError(err.message || "登录失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-rose-200/40 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute right-1/4 top-1/4 h-40 w-40 rounded-full bg-orange-300/25 blur-2xl" />
        <svg className="absolute left-1/4 top-1/3 h-64 w-64 text-orange-200/30" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="20" stroke="currentColor" strokeWidth="0.5" />
        </svg>
        <svg className="absolute bottom-1/3 right-1/3 h-48 w-48 text-rose-200/30" viewBox="0 0 200 200" fill="none">
          <rect x="20" y="20" width="160" height="160" rx="20" stroke="currentColor" strokeWidth="0.5" />
          <rect x="40" y="40" width="120" height="120" rx="12" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 shadow-lg shadow-orange-500/30 ring-1 ring-white/40">
            <ShoppingBag className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">教学资源商城</h1>
          <p className="text-sm text-slate-400">资源采购与管理平台</p>
        </div>

        <Card className="border-0 bg-white/90 shadow-2xl shadow-black/10 backdrop-blur-xl">
          <CardContent className="px-8 py-8">
            <div className="mb-6 flex rounded-lg bg-amber-50 p-1">
              {methodTabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  disabled={key !== "password"}
                  onClick={() => setLoginMethod(key)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                    loginMethod === key
                      ? "bg-white text-orange-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  } ${key !== "password" ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {loginMethod === "password" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-slate-700">账号</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="username"
                      placeholder="请输入账号"
                      className="border-slate-200 pl-10 focus-visible:border-orange-400 focus-visible:ring-orange-400/20"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="请输入密码"
                      className="border-slate-200 pl-10 focus-visible:border-orange-400 focus-visible:ring-orange-400/20"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-rose-500 py-2.5 text-base shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-rose-600"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? "登录中..." : "登 录"}
                </Button>
              </form>
            ) : loginMethod === "sms" ? (
              <div className="py-8 text-center text-sm text-slate-400">
                <MessageCircle className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p>短信登录功能开发中</p>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-slate-400">
                <QrCode className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p>微信扫码登录功能开发中</p>
              </div>
            )}

            <div className="mt-6 rounded-lg bg-amber-50/50 p-3 text-xs text-slate-400">
              <p className="mb-1 font-medium text-slate-500">测试账号：</p>
              <ul className="space-y-0.5">
                <li>运营方：operator / operator123</li>
                <li>学校管理员：school / school123</li>
                <li>企业：enterprise / enterprise123</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-300">
          © {new Date().getFullYear()} 教学资源商城 All Rights Reserved
        </p>
      </div>
    </div>
  )
}
