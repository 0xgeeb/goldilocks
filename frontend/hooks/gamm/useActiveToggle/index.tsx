import { useState } from "react"

export const useActiveToggle = (initialValue: string) => {

  const [activeToggle, setActiveToggle] = useState<string>(initialValue)

  const updateState = (toggle: string) => {
    setActiveToggle(toggle)
  }

  return [activeToggle, updateState]
}