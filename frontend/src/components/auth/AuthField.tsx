import { useState } from 'react'

type AuthFieldProps = {
  label: string
  name: string
  placeholder: string
  defaultValue?: string
  type?: string
}

export default function AuthField({
  defaultValue,
  label,
  name,
  placeholder,
  type = 'text',
}: AuthFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && isPasswordVisible ? 'text' : type

  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <span className="relative mt-2 block">
        <input
          className={`h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 ${
            isPassword ? 'pr-28' : ''
          }`}
          defaultValue={defaultValue}
          name={name}
          placeholder={placeholder}
          type={inputType}
        />

        {isPassword ? (
          <button
            aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
            className="absolute right-2 top-1/2 inline-flex h-8 -translate-y-1/2 items-center gap-1 rounded-md px-2 text-xs font-black text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            onClick={() => setIsPasswordVisible((current) => !current)}
            type="button"
          >
            {isPasswordVisible ? (
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                <path d="M9.5 5.3A9.6 9.6 0 0 1 12 5c5 0 8.5 4.5 9.7 6.3a1.4 1.4 0 0 1 0 1.4 18.7 18.7 0 0 1-2.3 2.8" />
                <path d="M6.2 6.7A18.6 18.6 0 0 0 2.3 11.3a1.4 1.4 0 0 0 0 1.4C3.5 14.5 7 19 12 19a9.8 9.8 0 0 0 4.2-.9" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M2.3 11.3a1.4 1.4 0 0 0 0 1.4C3.5 14.5 7 19 12 19s8.5-4.5 9.7-6.3a1.4 1.4 0 0 0 0-1.4C20.5 9.5 17 5 12 5s-8.5 4.5-9.7 6.3Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
            <span>{isPasswordVisible ? 'Ocultar' : 'Mostrar'}</span>
          </button>
        ) : null}
      </span>
    </label>
  )
}
