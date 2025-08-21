import { useEffect, useState } from 'react'

export default function useIsMobile(maxWidth = 767) {
  const getMatch = () =>
    typeof window !== 'undefined'
      ? window.matchMedia(`(max-width: ${maxWidth}px)`).matches
      : false

  const [isMobile, setIsMobile] = useState(getMatch)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia(`(max-width: ${maxWidth}px)`)
    const onChange = (e) => setIsMobile(e.matches)
    mql.addEventListener('change', onChange)
    setIsMobile(mql.matches)
    return () => mql.removeEventListener('change', onChange)
  }, [maxWidth])

  return isMobile
}
