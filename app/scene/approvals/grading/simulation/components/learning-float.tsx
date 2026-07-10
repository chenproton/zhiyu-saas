"use client"

import { useState } from "react"
import {
  BookMarked,
  ChevronDown,
  Maximize2,
  Minimize2,
  Send,
  Bot,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import type { SimulatedTask } from "./types"

interface LearningFloatProps {
  task: SimulatedTask
  defaultExpanded?: boolean
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

export function LearningFloat({ task, defaultExpanded = true }: LearningFloatProps) {
  const [minimized, setMinimized] = useState(!defaultExpanded)
  const [fullscreenOpen, setFullscreenOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `你好！我是你的 AI 学习助手。关于「${task.name}」这个任务，你可以问我任何问题，比如：\n\n· 这个任务的重点是什么？\n· 某个知识点怎么理解？\n· 有哪些学习建议？`,
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: inputValue.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInputValue("")
    setIsTyping(true)

    setTimeout(() => {
      const replies = [
        `这是一个很好的问题！关于「${task.name}」，建议你重点关注任务说明中的核心目标，并结合学习资源中的文档进行预习。`,
        `针对这个知识点，你可以在页面右侧「关联内容」面板中找到相关内容，点击可以查看详细说明。`,
        `建议你先阅读任务背景，理解业务场景后再开始实践。遇到困难可以随时在「关联内容」面板中查阅配套材料。`,
        `根据任务要求，你需要特别注意测评标准中的准确性、完整性和规范性三个方面。加油！`,
      ]
      const reply = replies[Math.floor(Math.random() * replies.length)]
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", content: reply }])
      setIsTyping(false)
    }, 1200)
  }

  const aiChatContent = (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-4 py-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "assistant" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                }`}
              >
                {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div
                className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${
                  msg.role === "assistant"
                    ? "bg-gray-50 border border-gray-200 text-gray-700"
                    : "bg-blue-500 text-white"
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-lg px-3 py-2 bg-gray-50 border border-gray-200">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-3 border-t shrink-0">
        <div className="flex gap-2">
          <Textarea
            placeholder="输入问题，AI 助手为你解答..."
            className="min-h-[44px] text-sm resize-none"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <Button size="sm" className="shrink-0 self-end h-10 w-10 p-0" onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  if (minimized) {
    const handleQuickAsk = () => {
      if (!inputValue.trim()) return
      handleSendMessage()
    }

    return (
      <div className="fixed bottom-4 right-6 z-50 w-[420px]">
        <div className="bg-white border rounded-xl shadow-lg flex items-center gap-2 px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Bot className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="随时向 AI 助手提问..."
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-gray-400"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleQuickAsk()
              }
            }}
            onFocus={() => setMinimized(false)}
          />
          <Button
            size="sm"
            className="h-8 w-8 p-0 shrink-0"
            onClick={handleQuickAsk}
            disabled={!inputValue.trim()}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 shrink-0 text-gray-400 hover:text-gray-600"
            onClick={() => setMinimized(false)}
            title="展开学习助手"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 普通浮窗 */}
      <div className="fixed bottom-6 right-6 z-50 w-96 max-h-[85vh] flex flex-col">
        <Card className="shadow-xl border overflow-hidden flex flex-col h-[600px]">
          <div className="flex items-center justify-between px-3 py-2.5 border-b bg-gray-50/50 shrink-0">
            <div className="flex items-center gap-2">
              <BookMarked className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">AI 学习助手</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setFullscreenOpen(true)} title="全屏展开">
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setMinimized(true)} title="最小化">
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          {aiChatContent}
        </Card>
      </div>

      {/* 全屏弹窗 */}
      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-[95vw] sm:max-h-[95vh] h-[95vh] w-[95vw] p-0 flex flex-col gap-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/50 shrink-0">
              <div className="flex items-center gap-2">
                <BookMarked className="h-5 w-5 text-blue-500" />
                <span className="text-base font-medium">AI 学习助手</span>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setFullscreenOpen(false)} title="退出全屏">
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              {aiChatContent}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
