import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function OTPInput({
  length = 4,
  value,
  onChange,
  disabled = false,
}: OTPInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  const digits = value.split('').slice(0, length)
  while (digits.length < length) digits.push('')

  function focusInput(index: number) {
    const el = inputsRef.current[index]
    if (el) el.focus()
  }

  function handleChange(idx: number, char: string) {
    if (!/^\d$/.test(char)) return
    const newVal = value.slice(0, idx) + char + value.slice(idx + 1)
    onChange(newVal.slice(0, length))
    if (idx < length - 1) focusInput(idx + 1)
  }

  function handleKeyDown(idx: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (value[idx]) {
        const newVal = value.slice(0, idx) + value.slice(idx + 1)
        onChange(newVal)
      } else if (idx > 0) {
        focusInput(idx - 1)
      }
    }
    if (e.key === 'ArrowLeft' && idx > 0) focusInput(idx - 1)
    if (e.key === 'ArrowRight' && idx < length - 1) focusInput(idx + 1)
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pasted) {
      onChange(pasted)
      focusInput(Math.min(pasted.length, length - 1))
    }
  }

  return (
    <div className="flex gap-3 justify-center">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputsRef.current[idx] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onFocus={(e) => e.target.select()}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={idx === 0 ? handlePaste : undefined}
          className="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 border-slate-200 bg-white text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all disabled:opacity-60"
        />
      ))}
    </div>
  )
}
