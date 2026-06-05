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
  width: 16,
  height: 16,
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

function lerp(current: number, target: number, ease: number) {
  return current + (target - current) * ease
}

export function FluidCursor() {
  const { features } = useMotion()
  const [enabled, setEnabled] = React.useState(false)
  const cursorRef = React.useRef<HTMLDivElement | null>(null)
  const state = React.useRef<CursorState>(DEFAULT_STATE)
  const rendered = React.useRef<CursorState>(DEFAULT_STATE)
  const velocity = React.useRef({ x: 0, y: 0 })
  const lastPointer = React.useRef({ x: -100, y: -100 })
  const raf = React.useRef<number | null>(null)

  React.useEffect(() => {
    setEnabled(features.cursor && canUseFinePointer())
  }, [features.cursor])

  React.useEffect(() => {
    if (!enabled) return undefined

    const root = document.documentElement
    root.classList.add("sk-fluid-cursor-active")

    const setTargetFromElement = (el: Element | null, x: number, y: number) => {
      velocity.current = {
        x: x - lastPointer.current.x,
        y: y - lastPointer.current.y,
      }
      lastPointer.current = { x, y }

      const textTarget = el?.closest(TEXT_SELECTOR)
      if (textTarget instanceof HTMLElement) {
        const rect = textTarget.getBoundingClientRect()
        state.current = {
          ...state.current,
          x,
          y,
          width: clamp(rect.height * 0.34, 12, 20),
          height: clamp(rect.height * 0.92, 24, 44),
          radius: 999,
          opacity: 1,
          mode: "text",
        }
        return
      }

      const target = el?.closest(TARGET_SELECTOR)
      if (target instanceof HTMLElement) {
        const rect = target.getBoundingClientRect()
        const padX = clamp(rect.width * 0.11, 8, 18)
        const padY = clamp(rect.height * 0.16, 7, 14)
        state.current = {
          ...state.current,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: clamp(rect.width + padX * 2, 34, 260),
          height: clamp(rect.height + padY * 2, 34, 112),
          radius: clamp(rect.height / 2 + padY, 14, 34),
          opacity: 1,
          mode: "target",
        }
        return
      }

      const stretch = clamp(Math.hypot(velocity.current.x, velocity.current.y) * 0.18, 0, 12)
      state.current = {
        ...state.current,
        x,
        y,
        width: 16 + stretch,
        height: 16 - stretch * 0.28,
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
        const easing = target.mode === "target" ? 0.16 : target.mode === "text" ? 0.2 : 0.18
        const sizeEase = target.mode === "target" ? 0.14 : 0.19
        const next: CursorState = {
          x: lerp(current.x, target.x, easing),
          y: lerp(current.y, target.y, easing),
          width: lerp(current.width, target.width, sizeEase),
          height: lerp(current.height, target.height, sizeEase),
          radius: lerp(current.radius, target.radius, 0.13),
          opacity: lerp(current.opacity, target.opacity, 0.24),
          mode: target.mode,
          pressed: target.pressed,
        }
        rendered.current = next

        const speed = clamp(Math.hypot(velocity.current.x, velocity.current.y), 0, 36)
        const angle = Math.atan2(velocity.current.y, velocity.current.x) || 0
        const squash = next.mode === "idle" ? 1 + speed * 0.008 : 1
        const scale = next.pressed ? 0.9 : 1
        node.style.opacity = String(next.opacity)
        node.style.borderRadius = `${next.radius}px`
        node.style.width = `${next.width}px`
        node.style.height = `${next.height}px`
        node.style.transform = `translate3d(${next.x - next.width / 2}px, ${next.y - next.height / 2}px, 0) rotate(${angle}rad) scale(${scale * squash}, ${scale / squash})`
        node.dataset.mode = next.mode
      }
      velocity.current = { x: velocity.current.x * 0.82, y: velocity.current.y * 0.82 }
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

  return (
    <>
      <svg className="sk-fluid-cursor-svg" aria-hidden focusable="false">
        <filter id="sk-fluid-cursor-goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </svg>
      <div ref={cursorRef} className="sk-fluid-cursor" aria-hidden />
    </>
  )
}
