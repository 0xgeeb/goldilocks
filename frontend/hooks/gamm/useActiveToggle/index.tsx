import { useState } from "react"

type ActiveToggleHookResult = [string, (toggle: string) => void]

export const useActiveToggle = (initialValue: string): ActiveToggleHookResult => {

  const [activeToggle, setActiveToggle] = useState<string>(initialValue)

  const updateState = (toggle: string) => {
    setActiveToggle(toggle)
  }

  return [activeToggle, updateState]
}