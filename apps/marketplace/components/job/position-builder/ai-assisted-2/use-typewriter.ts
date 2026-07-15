'use client'

import { useState, useEffect } from 'react'

export function useTypewriter(text: string, speed: number = 30, startDelay: number = 0) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setStarted(false)
    const startTimer = setTimeout(() => {
      setStarted(true)
    }, startDelay)
    return () => clearTimeout(startTimer)
  }, [text, startDelay])

  useEffect(() => {
    if (!started) return
    if (displayed.length >= text.length) return

    const timer = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1))
    }, speed)

    return () => clearTimeout(timer)
  }, [started, displayed, text, speed])

  return displayed
}

export function useTypewriterArray(items: string[], itemDelay: number = 600, charSpeed: number = 30) {
  const [displayedItems, setDisplayedItems] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')

  useEffect(() => {
    setDisplayedItems([])
    setCurrentIndex(0)
    setCurrentText('')
  }, [items.join('|')])

  useEffect(() => {
    if (currentIndex >= items.length) return
    const target = items[currentIndex]
    if (currentText.length < target.length) {
      const timer = setTimeout(() => {
        setCurrentText(target.slice(0, currentText.length + 1))
      }, charSpeed)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        setDisplayedItems(prev => [...prev, target])
        setCurrentIndex(prev => prev + 1)
        setCurrentText('')
      }, itemDelay)
      return () => clearTimeout(timer)
    }
  }, [currentIndex, currentText, items, itemDelay, charSpeed])

  return { displayedItems, currentItem: currentIndex < items.length ? currentText : null, isDone: currentIndex >= items.length }
}
