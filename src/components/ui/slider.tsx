import * as React from "react"
import { cn } from "../../lib/utils"

interface SliderProps {
  value?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value = [0, 100], onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const [isDragging, setIsDragging] = React.useState<'min' | 'max' | null>(null)
    const [localValue, setLocalValue] = React.useState(value)
    const sliderRef = React.useRef<HTMLDivElement>(null)
    const animationFrameRef = React.useRef<number>()

    // Sync local value with prop value
    React.useEffect(() => {
      setLocalValue(value)
    }, [value])

    const updateValue = React.useCallback((newValue: number[], immediate = false) => {
      if (immediate) {
        setLocalValue(newValue)
        onValueChange?.(newValue)
      } else {
        setLocalValue(newValue)
        // Debounce the callback to improve performance
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        animationFrameRef.current = requestAnimationFrame(() => {
          onValueChange?.(newValue)
        })
      }
    }, [onValueChange])

    const handleMouseDown = (e: React.MouseEvent, type: 'min' | 'max') => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(type)
    }

    const handleMouseMove = React.useCallback((e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return

      const rect = sliderRef.current.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const newValue = min + percentage * (max - min)
      const steppedValue = Math.round(newValue / step) * step
      const clampedValue = Math.max(min, Math.min(max, steppedValue))

      if (isDragging === 'min') {
        const newMin = Math.min(clampedValue, localValue[1] - step)
        updateValue([newMin, localValue[1]])
      } else {
        const newMax = Math.max(clampedValue, localValue[0] + step)
        updateValue([localValue[0], newMax])
      }
    }, [isDragging, min, max, step, localValue, updateValue])

    const handleMouseUp = React.useCallback(() => {
      if (isDragging) {
        // Final update with immediate callback
        updateValue(localValue, true)
        setIsDragging(null)
      }
    }, [isDragging, localValue, updateValue])

    const handleTouchStart = (e: React.TouchEvent, type: 'min' | 'max') => {
      e.preventDefault()
      setIsDragging(type)
    }

    const handleTouchMove = React.useCallback((e: TouchEvent) => {
      if (!isDragging || !sliderRef.current || e.touches.length === 0) return

      const rect = sliderRef.current.getBoundingClientRect()
      const touch = e.touches[0]
      const percentage = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width))
      const newValue = min + percentage * (max - min)
      const steppedValue = Math.round(newValue / step) * step
      const clampedValue = Math.max(min, Math.min(max, steppedValue))

      if (isDragging === 'min') {
        const newMin = Math.min(clampedValue, localValue[1] - step)
        updateValue([newMin, localValue[1]])
      } else {
        const newMax = Math.max(clampedValue, localValue[0] + step)
        updateValue([localValue[0], newMax])
      }
    }, [isDragging, min, max, step, localValue, updateValue])

    const handleTouchEnd = React.useCallback(() => {
      if (isDragging) {
        updateValue(localValue, true)
        setIsDragging(null)
      }
    }, [isDragging, localValue, updateValue])

    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove, { passive: false })
        document.addEventListener('mouseup', handleMouseUp)
        document.addEventListener('touchmove', handleTouchMove, { passive: false })
        document.addEventListener('touchend', handleTouchEnd)
        
        return () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
          document.removeEventListener('touchmove', handleTouchMove)
          document.removeEventListener('touchend', handleTouchEnd)
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
          }
        }
      }
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

    const minPercentage = ((localValue[0] - min) / (max - min)) * 100
    const maxPercentage = ((localValue[1] - min) / (max - min)) * 100

    return (
      <div 
        ref={ref}
        className={cn("relative flex w-full items-center h-6 select-none", className)}
        {...props}
      >
        <div
          ref={sliderRef}
          className="relative w-full h-2 bg-slate-200 rounded-lg cursor-pointer"
        >
          {/* Track background */}
          <div className="absolute inset-0 bg-slate-200 rounded-lg" />
          
          {/* Active range */}
          <div 
            className="absolute h-2 bg-emerald-600 rounded-lg transition-all duration-75"
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`
            }}
          />
          
          {/* Min thumb */}
          <div
            className={cn(
              "absolute w-5 h-5 bg-emerald-600 border-2 border-white rounded-full cursor-pointer shadow-md transform -translate-y-1.5 -translate-x-2.5 transition-all duration-75",
              isDragging === 'min' && "scale-110 shadow-lg"
            )}
            style={{ left: `${minPercentage}%` }}
            onMouseDown={(e) => handleMouseDown(e, 'min')}
            onTouchStart={(e) => handleTouchStart(e, 'min')}
          />
          
          {/* Max thumb */}
          <div
            className={cn(
              "absolute w-5 h-5 bg-emerald-600 border-2 border-white rounded-full cursor-pointer shadow-md transform -translate-y-1.5 -translate-x-2.5 transition-all duration-75",
              isDragging === 'max' && "scale-110 shadow-lg"
            )}
            style={{ left: `${maxPercentage}%` }}
            onMouseDown={(e) => handleMouseDown(e, 'max')}
            onTouchStart={(e) => handleTouchStart(e, 'max')}
          />
        </div>
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
