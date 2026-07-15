"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, X, Minimize2, Maximize2, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface AiChatMessage {
  role: "user" | "assistant"
  content: string
}

interface AiChatPanelProps {
  title?: string
  placeholder?: string
  quickQuestions?: string[]
  onSendMessage: (message: string) => string
  defaultExpanded?: boolean
  className?: string
}

export function AiChatPanel({
  title = "AI 学习助手",
  placeholder = "输入问题，AI 将结合当前任务上下文回答...",
  quickQuestions = [],
  onSendMessage,
  defaultExpanded = false,
  className,
}: AiChatPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      role: "assistant",
      content: "你好！我是你的 AI 学习助手。我会结合当前场景和任务的上下文来回答你的问题，帮助你更好地理解和完成任务。请注意，我不会直接给出测评答案哦~",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setMessages((prev) => [...prev, { role: "user", content: userMsg }])
    setInput("")
    setLoading(true)

    // Simulate AI thinking delay
    setTimeout(() => {
      const response = onSendMessage(userMsg)
      setMessages((prev) => [...prev, { role: "assistant", content: response }])
      setLoading(false)
    }, 800)
  }

  const handleQuickQuestion = (q: string) => {
    setMessages((prev) => [...prev, { role: "user", content: q }])
    setLoading(true)
    setTimeout(() => {
      const response = onSendMessage(q)
      setMessages((prev) => [...prev, { role: "assistant", content: response }])
      setLoading(false)
    }, 800)
  }

  if (!expanded) {
    return (
      <Button
        onClick={() => setExpanded(true)}
        className={cn("fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg p-0 bg-purple-600 hover:bg-purple-700", className)}
      >
        <Sparkles className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <div className={cn("fixed bottom-6 right-6 w-[400px] h-[550px] bg-white rounded-xl shadow-2xl border flex flex-col overflow-hidden z-50", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-purple-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <span className="font-medium text-sm text-purple-900">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setExpanded(false)}>
            <Minimize2 className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-purple-600" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                  msg.role === "user" ? "bg-purple-600 text-white" : "bg-gray-50 text-gray-800 border"
                )}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <Bot className="h-3.5 w-3.5 text-purple-600 animate-pulse" />
              </div>
              <div className="bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Questions */}
      {quickQuestions.length > 0 && (
        <div className="px-4 py-2 border-t bg-gray-50/50">
          <div className="flex flex-wrap gap-1.5">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleQuickQuestion(q)}
                className="text-xs px-2.5 py-1 rounded-full bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t flex items-center gap-2">
        <Input
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 h-9 text-sm"
        />
        <Button size="sm" className="h-9 px-3 bg-purple-600 hover:bg-purple-700" onClick={handleSend} disabled={loading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
