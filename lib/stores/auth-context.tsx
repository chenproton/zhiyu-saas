'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User, UserRole } from '@/lib/types/job-source'
import { mockUsers } from '@/lib/mock-data/job/users'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (role: UserRole) => void
  logout: () => void
  switchRole: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'career-platform-auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // 从 localStorage 恢复用户状态；无记录时默认以管理者登录
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        const foundUser = mockUsers.find(u => u.id === data.userId)
        if (foundUser) {
          setUser(foundUser)
        }
      } catch {
        // 忽略解析错误
      }
    } else {
      const adminUser = mockUsers.find(u => u.role === 'admin')
      if (adminUser) {
        setUser(adminUser)
      }
    }
    setIsLoaded(true)
  }, [])

  // 保存用户状态到 localStorage
  useEffect(() => {
    if (isLoaded) {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId: user.id }))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [user, isLoaded])

  const login = (role: UserRole) => {
    const foundUser = mockUsers.find(u => u.role === role)
    if (foundUser) {
      setUser(foundUser)
    }
  }

  const logout = () => {
    setUser(null)
  }

  const switchRole = (role: UserRole) => {
    const foundUser = mockUsers.find(u => u.role === role)
    if (foundUser) {
      setUser(foundUser)
    }
  }

  // 等待客户端加载完成
  if (!isLoaded) {
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
