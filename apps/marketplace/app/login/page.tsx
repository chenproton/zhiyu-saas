"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, GraduationCap } from "lucide-react"
import { authApi, setToken, removeToken } from "@/lib/api"
import { useAuth } from "@/components/auth-provider"

function getPostLoginPath(identityCode?: string): string | null {
  switch (identityCode) {
    case "platform_admin":
      return "/admin"
    case "school_admin":
      // 学校在商城侧是采购方
      return "/purchased"
    case "enterprise_hr":
    case "enterprise_mentor":
      // 企业在商城侧是资源提供方
      return "/my-resources"
    case "teacher":
    case "student":
      // 教师/学生属于教育管理平台，不允许在商城登录
      return null
    default:
      return "/"
  }
}

export default function LoginPage() {
  const router = useRouter()
  const { refresh } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await authApi.saasLogin({ username, password })
      setToken(res.token, "saas")
      await refresh()
      const me = await authApi.saasMe()
      const identityCode = me.identityType?.code
      const nextPath = getPostLoginPath(identityCode)
      if (nextPath === null) {
        // 教师/学生账号在商城登录时清理 token 并给出明确提示
        removeToken("saas")
        setError("教师和学生账号请访问教育管理平台登录：http://localhost:3020/portal/login")
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
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
            <GraduationCap className="h-6 w-6 text-accent-foreground" />
          </div>
          <h1 className="text-2xl font-bold">教学资源商城</h1>
          <p className="text-sm text-muted-foreground">账号密码登录</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">登录</CardTitle>
            <CardDescription>请输入您的账号和密码</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">账号</Label>
                <Input
                  id="username"
                  placeholder="请输入账号"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "登录中..." : "登录"}
              </Button>
            </form>

            <div className="mt-4 text-xs text-muted-foreground">
              <p>测试账号：</p>
              <ul className="mt-1 list-inside list-disc">
                <li>运营方：operator / operator123</li>
                <li>学校管理员：school / school123</li>
                <li>企业：enterprise / enterprise123</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
