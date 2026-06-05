"use client"

import * as React from "react"
import { useMotion } from "./motion"

type CursorMode = "idle" | "target" | "text"

type CursorState = {
  x: number
  y: number
  width: number
  height: number
  radius: number
  opacity: number
  mode: CursorMode
  pressed: boolean
}

const DEFAULT_STATE: CursorState = {
  x: -100,
  y: -100,
  width: 18,
  height: 18,
  radius: 999,
  opacity: 0,
  mode: "idle",
  pressed: false,
}

const TARGET_SELECTOR = [
  "button:not(:disabled)",
  "a[href]",
  "[role='button']",
  "[role='tab']",
  "[role='switch']",
  "[role='radio']",
  "[role='menuitem']",
  "[role='option']",
  "summary",
  "label[for]",
  "select",
  "[data-slot='select-trigger']",
  "[data-slot='trigger']",
].join(",")

const TEXT_SELECTOR = [
  "input:not([type='checkbox']):not([type='radio']):not([type='range']):not([type='button']):not([type='submit']):not([type='reset']):not([type='file']):not([type='color'])",
  "textarea",
  "[contenteditable='true']",
].join(",")

function canUseFinePointer() {
  if (typeof window === "undefined" || !window.matchMedia) return false
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function FluidCursor() {
  const { features } = useMotion()
  const [enabled, setEnabled] = React.useState(false)
  const cursorRef = React.useRef<HTMLDivElement | null>(null)
  const state = React.useRef<CursorState>(DEFAULT_STATE)
  const rendered = React.useRef<CursorState>(DEFAULT_STATE)
  const raf = React.useRef<number | null>(null)

  React.useEffect(() => {
    setEnabled(features.cursor && canUseFinePointer())
  }, [features.cursor])

  React.useEffect(() => {
    if (!enabled) return undefined

    const root = document.documentElement
    root.classList.add("sk-fluid-cursor-active")

    const setTargetFromElement = (el: Element | null, x: number, y: number) => {
      const textTarget = el?.closest(TEXT_SELECTOR)
      if (textTarget instanceof HTMLElement) {
        const rect = textTarget.getBoundingClientRect()
        state.current = {
          ...state.current,
          x: x - 1,
          y,
          width: 2,
          height: clamp(rect.height * 0.58, 18, 34),
          radius: 999,
          opacity: 1,
          mode: "text",
        }
        return
      }

      const target = el?.closest(TARGET_SELECTOR)
      if (target instanceof HTMLElement) {
        const rect = target.getBoundingClientRect()
        const pad = 7
        state.current = {
          ...state.current,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: clamp(rect.width + pad * 2, 28, 220),
          height: clamp(rect.height + pad * 2, 28, 96),
          radius: Math.min(28, Math.max(12, rect.height / 2 + pad)),
          opacity: 1,
          mode: "target",
        }
        return
      }

      state.current = {
        ...state.current,
        x,
        y,
        width: 18,
        height: 18,
        radius: 999,
        opacity: 1,
        mode: "idle",
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return
      const el = document.elementFromPoint(event.clientX, event.clientY)
      setTargetFromElement(el, event.clientX, event.clientY)
    }

    const onPointerEnter = () => {
      state.current.opacity = 1
    }

    const onPointerLeave = () => {
      state.current.opacity = 0
    }

    const onPointerDown = () => {
      state.current.pressed = true
    }

    const onPointerUp = () => {
      state.current.pressed = false
    }

    const tick = () => {
      const node = cursorRef.current
      if (node) {
        const current = rendered.current
        const target = state.current
        const ease = target.mode === "target" ? 0.22 : 0.18
        const next: CursorState = {
          x: current.x + (target.x - current.x) * ease,
          y: current.y + (target.y - current.y) * ease,
          width: current.width + (target.width - current.width) * 0.24,
          height: current.height + (target.height - current.height) * 0.24,
          radius: current.radius + (target.radius - current.radius) * 0.24,
          opacity: current.opacity + (target.opacity - current.opacity) * 0.22,
          mode: target.mode,
          pressed: target.pressed,
        }
        rendered.current = next

        const scale = next.pressed ? 0.92 : 1
        node.style.opacity = String(next.opacity)
        node.style.borderRadius = `${next.radius}px`
        node.style.width = `${next.width}px`
        node.style.height = `${next.height}px`
        node.style.transform = `translate3d(${next.x - next.width / 2}px, ${next.y - next.height / 2}px, 0) scale(${scale})`
        node.dataset.mode = next.mode
      }
      raf.current = window.requestAnimationFrame(tick)
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true })
    window.addEventListener("pointerenter", onPointerEnter)
    window.addEventListener("pointerleave", onPointerLeave)
    window.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("pointerup", onPointerUp)
    raf.current = window.requestAnimationFrame(tick)

    return () => {
      root.classList.remove("sk-fluid-cursor-active")
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerenter", onPointerEnter)
      window.removeEventListener("pointerleave", onPointerLeave)
      window.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("pointerup", onPointerUp)
      if (raf.current) window.cancelAnimationFrame(raf.current)
      raf.current = null
    }
  }, [enabled])

  if (!enabled) return null

  return <div ref={cursorRef} className="sk-fluid-cursor" aria-hidden />
}
