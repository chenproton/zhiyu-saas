"use client"

import {
  BookOpen,
  FileText,
  Lightbulb,
  Award,
  Link2,
  Video,
  Image,
  File,
  ExternalLink,
  CheckCircle2,
  Circle,
  GraduationCap,
  Target,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { SimulatedTask } from "./types"

const resourceTypeIcons: Record<string, React.ReactNode> = {
  link: <Link2 className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  image: <Image className="h-4 w-4" />,
  tool: <ExternalLink className="h-4 w-4" />,
}

interface LearningPanelProps {
  task: SimulatedTask
  isCompact?: boolean
  onMarkComplete?: () => void
  isCompleted?: boolean
}

export function LearningPanel({ task, isCompact, onMarkComplete, isCompleted }: LearningPanelProps) {
  return (
    <div className="space-y-4">
      {/* 任务背景 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-blue-500" />
            任务背景
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{task.background}</p>
        </CardContent>
      </Card>

      {/* 任务说明 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-500" />
            任务说明
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 whitespace-pre-line">{task.detailedDescription}</div>
        </CardContent>
      </Card>

      {/* 知识点 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            考查知识点
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {task.knowledgePoints.map((kp) => (
              <div key={kp.id} className="flex items-start gap-2">
                <BookOpen className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium">{kp.name}</div>
                  <div className="text-xs text-gray-500">{kp.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 能力点 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="h-4 w-4 text-purple-500" />
            考查能力点
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {task.abilityPoints.map((ap) => (
              <div key={ap.id} className="flex items-start gap-2">
                <Award className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium">{ap.name}</div>
                  <div className="text-xs text-gray-500">{ap.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 学习资源 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Link2 className="h-4 w-4 text-cyan-500" />
            配套资源
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {task.resources.map((res) => (
              <div
                key={res.id}
                className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-gray-400 mt-0.5 shrink-0">
                  {resourceTypeIcons[res.type] || <File className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{res.name}</div>
                  <div className="text-xs text-gray-500">{res.description}</div>
                  {res.url && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {res.type}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 完成学习按钮 */}
      {onMarkComplete && !isCompact && (
        <Button
          className="w-full"
          variant={isCompleted ? "outline" : "default"}
          onClick={onMarkComplete}
          disabled={isCompleted}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              已完成学习
            </>
          ) : (
            <>
              <Circle className="mr-2 h-4 w-4" />
              标记学习完成
            </>
          )}
        </Button>
      )}
    </div>
  )
}

// 紧凑版学习资源抽屉/侧边栏内容
export function LearningSidebar({ task }: { task: SimulatedTask }) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <LearningPanel task={task} isCompact />
      </div>
    </ScrollArea>
  )
}
