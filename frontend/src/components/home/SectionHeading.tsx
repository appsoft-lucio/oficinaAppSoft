type SectionHeadingProps = {
  eyebrow: string
  title: string
  description: string
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'light',
}: SectionHeadingProps) {
  const alignment = align === 'center' ? 'mx-auto text-center' : ''
  const titleColor = tone === 'dark' ? 'text-white' : 'text-slate-950'
  const descriptionColor = tone === 'dark' ? 'text-slate-300' : 'text-slate-600'

  return (
    <div className={`max-w-3xl ${alignment}`}>
      <p className="mb-3 text-[13px] font-black uppercase tracking-[0.18em] text-orange-600">
        {eyebrow}
      </p>
      <h2 className={`text-3xl font-black leading-tight sm:text-4xl ${titleColor}`}>
        {title}
      </h2>
      <p className={`mt-4 text-[17px] leading-8 ${descriptionColor}`}>{description}</p>
    </div>
  )
}
