type AuthFieldProps = {
  label: string
  name: string
  placeholder: string
  type?: string
}

export default function AuthField({
  label,
  name,
  placeholder,
  type = 'text',
}: AuthFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input
        className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
        name={name}
        placeholder={placeholder}
        type={type}
      />
    </label>
  )
}
