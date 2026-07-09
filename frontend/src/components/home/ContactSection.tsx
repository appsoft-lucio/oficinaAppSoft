export default function ContactSection() {
  return (
    <section id="contato" className="px-5 pb-16 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-2xl bg-orange-600 p-6 text-white sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-10">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-100">
            Próximo passo
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
            Vamos montar uma demonstração com a cara da sua oficina?
          </h2>
          <p className="mt-4 max-w-2xl text-[17px] leading-8 text-orange-50">
            Use esta landing para apresentar a ideia, coletar feedback e transformar as
            primeiras conversas em direção para o produto.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0">
          <a
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#25d366] px-6 text-[15px] font-black text-white shadow-lg shadow-green-900/20 transition hover:bg-[#1ebe5d]"
            href="https://wa.me/5531983044087"
            rel="noreferrer"
            target="_blank"
          >
            Chamar no WhatsApp
          </a>
          <a
            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-orange-200 px-6 text-[15px] font-black text-white transition hover:bg-orange-500"
            href="mailto:luciocdesouza@gmail.com"
          >
            Enviar e-mail
          </a>
        </div>
      </div>
    </section>
  )
}
