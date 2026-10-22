import { useEffect, useRef } from 'react'

/** Thin gradient bar at the top of the page that fills as the visitor scrolls. */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    let frame = 0
    function update() {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`
    }
    function onScroll() {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return <div ref={barRef} aria-hidden="true" className="landing-scroll-progress" />
}
