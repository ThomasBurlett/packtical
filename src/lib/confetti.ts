import confetti from "canvas-confetti"

function getElementOrigin(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  const x = (rect.left + rect.width / 2) / window.innerWidth
  const y = (rect.top + rect.height / 2) / window.innerHeight

  return {
    x: Math.min(Math.max(x, 0.08), 0.92),
    y: Math.min(Math.max(y, 0.08), 0.92),
  }
}

export function fireItemConfetti(element: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return
  }

  const origin = getElementOrigin(element)

  void confetti({
    angle: 82,
    disableForReducedMotion: true,
    drift: 0.12,
    gravity: 1.1,
    origin,
    particleCount: 16,
    scalar: 0.8,
    spread: 34,
    startVelocity: 20,
    ticks: 120,
    zIndex: 2000,
  })

  void confetti({
    angle: 98,
    disableForReducedMotion: true,
    drift: -0.12,
    gravity: 1.1,
    origin,
    particleCount: 10,
    scalar: 0.65,
    spread: 22,
    startVelocity: 16,
    ticks: 110,
    zIndex: 2000,
  })
}

export function fireCompletionConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return
  }

  const burst = (particleRatio: number, options: confetti.Options) =>
    void confetti({
      ...options,
      disableForReducedMotion: true,
      origin: { y: 0.62, ...(options.origin ?? {}) },
      particleCount: Math.floor(240 * particleRatio),
      zIndex: 2000,
    })

  burst(0.24, {
    spread: 30,
    startVelocity: 62,
  })

  burst(0.2, {
    decay: 0.91,
    scalar: 1.1,
    spread: 78,
  })

  burst(0.32, {
    decay: 0.93,
    scalar: 0.92,
    spread: 112,
  })

  burst(0.14, {
    drift: -0.2,
    origin: { x: 0.18 },
    scalar: 1.18,
    spread: 130,
    startVelocity: 42,
  })

  burst(0.14, {
    drift: 0.2,
    origin: { x: 0.82 },
    scalar: 1.18,
    spread: 130,
    startVelocity: 42,
  })
}
