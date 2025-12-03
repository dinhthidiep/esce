// import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
// import * as signalR from '@microsoft/signalr'
import { createContext, useContext, useEffect, useRef, useState } from 'react'

interface NotificationItem {
  Id?: number | string
  id?: number | string
  CreatedAt?: string
  createdAt?: string
  IsRead?: boolean
  isRead?: boolean
  [key: string]: any
}

interface NotificationContextType {
  notifications: NotificationItem[]
  isConnected: boolean
  addNotification: (n: NotificationItem) => void
  removeNotification: (id: string | number) => void
  markAsRead: (id: string | number) => void
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  // SignalR is temporarily disabled; keep flag false
  const [isConnected] = useState(false)
  // SignalR connection & polling disabled for now
  // const connectionRef = useRef<null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Polling function to fetch notifications (fallback when SignalR is not available)
  // Optional polling function (removed for now to avoid unused warnings)

  useEffect(() => {
    // SignalR temporarily disabled; use only optional polling.
    const token = localStorage.getItem('token')
    if (!token) {
      return
    }

    // Optional: enable simple polling (endpoint may not exist; failures are silent)
    // fetchNotifications()
    // pollingIntervalRef.current = setInterval(fetchNotifications, 30000)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  const addNotification = (notification: NotificationItem) => {
    setNotifications((prev: NotificationItem[]) => {
      const exists = prev.some((n: NotificationItem) => n.Id === notification.Id || n.id === notification.id)
      if (exists) return prev
      return [notification, ...prev]
    })
  }

  const removeNotification = (notificationId: string | number) => {
    setNotifications((prev: NotificationItem[]) =>
      prev.filter((n: NotificationItem) => (n.Id || n.id) !== notificationId),
    )
  }

  const markAsRead = (notificationId: string | number) => {
    setNotifications((prev: NotificationItem[]) =>
      prev.map((n: NotificationItem) => {
        if ((n.Id || n.id) === notificationId) {
          return { ...n, IsRead: true, isRead: true }
        }
        return n
      })
    )
  }

  const value = {
    notifications,
    isConnected,
    addNotification,
    removeNotification,
    markAsRead,
    setNotifications
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
