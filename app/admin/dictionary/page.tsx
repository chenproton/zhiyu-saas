"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { BookOpen, Info } from "lucide-react"
import {
  MAJOR_TAGS,
  INDUSTRY_TAGS,
  EDUCATION_LEVELS,
  DIFFICULTY_LEVELS,
} from "@/lib/resource-constants"

type TabDef = {
  id: string
  label: string
  type: "major" | "industry" | "level" | "difficulty"
}

const tabs: TabDef[] = [
  { id: "majors", label: "专业标签", type: "major" },
  { id: "industries", label: "行业标签", type: "industry" },
  { id: "levels", label: "适用层次", type: "level" },
  { id: "difficulties", label: "难度等级", type: "difficulty" },
]

const dictionaryMap: Record<TabDef["type"], readonly string[]> = {
  major: MAJOR_TAGS,
  industry: INDUSTRY_TAGS,
  level: EDUCATION_LEVELS,
  difficulty: DIFFICULTY_LEVELS,
}

export default function AdminDictionaryPage() {
  const [activeTab, setActiveTab] = useState("majors")

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">标签字典</h1>
          <p className="text-sm text-muted-foreground">专业、行业、适用层次、难度等级等标签参考值</p>
        </div>

        <div className="rounded-md border border-border/60 bg-muted/40 px-4 py-3 text-sm text-muted-foreground flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            当前标签值由平台统一维护，用于资源发布时的下拉选择。后端尚未提供字典管理接口，本页仅作只读参考。
          </span>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-accent" />
                    {tab.label}
                  </CardTitle>
                  <CardDescription>共 {dictionaryMap[tab.type].length} 个标签</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>标签名称</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dictionaryMap[tab.type].map((item) => (
                        <TableRow key={item}>
                          <TableCell>
                            <Badge variant="secondary">{item}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
