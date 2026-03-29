

export default function Footer() {
  return (
    <footer className="bg-verde-escuro text-verde-claro/80">

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">

          {/* Sobre */}
          <div>
            <h2 className="text-verde-claro font-semibold text-sm uppercase tracking-wider mb-3">
              Sobre
            </h2>
            <hr className="border-white/20 mb-4" />
            <ul className="space-y-2">
              {["Quem Somos", "Perguntas Frequentes", "Seja um Franqueado", "Nossas Lojas", "Trabalhe Conosco"].map((item) => (
                <li key={item}>
                  <a href="" className="text-sm hover:text-verde-claro transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Área do Cliente */}
          <div>
            <h2 className="text-verde-claro font-semibold text-sm uppercase tracking-wider mb-3">
              Área do Cliente
            </h2>
            <hr className="border-white/20 mb-4" />
            <ul className="space-y-2">
              {["Minha Conta", "Meus Pedidos"].map((item) => (
                <li key={item}>
                  <a href="" className="text-sm hover:text-verde-claro transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Políticas */}
          <div>
            <h2 className="text-verde-claro font-semibold text-sm uppercase tracking-wider mb-3">
              Políticas
            </h2>
            <hr className="border-white/20 mb-4" />
            <ul className="space-y-2">
              {["Privacidade", "Termos de Uso", "Trocas e Devolução", "Entrega e Frete", "Pagamento"].map((item) => (
                <li key={item}>
                  <a href="" className="text-sm hover:text-verde-claro transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h2 className="text-verde-claro font-semibold text-sm uppercase tracking-wider mb-3">
              Contato
            </h2>
            <hr className="border-white/20 mb-4" />

            <div className="flex gap-3 mb-4">
              <a href="" aria-label="Instagram"
                className="text-verde-claro/60 hover:text-verde-claro transition-colors duration-200">
                
              </a>
              <a href="" aria-label="Facebook"
                className="text-verde-claro/60 hover:text-verde-claro transition-colors duration-200">
                
              </a>
              <a href="" aria-label="WhatsApp"
                className="text-verde-claro/60 hover:text-verde-claro transition-colors duration-200">
                
              </a>
              <a href="" aria-label="YouTube"
                className="text-verde-claro/60 hover:text-verde-claro transition-colors duration-200">
                
              </a>
            </div>

            <ul className="space-y-1">
              <li className="text-sm">45 99999-9999</li>
              <li className="text-sm">47 99999-9999</li>
              <li className="text-sm">sac@loja.com.br</li>
            </ul>
          </div>

          {/* Formas de Pagamento */}
          <div>
            <h2 className="text-verde-claro font-semibold text-sm uppercase tracking-wider mb-3">
              Formas de Pagamento
            </h2>
            <hr className="border-white/20 mb-4" />

            <div className="flex flex-wrap gap-2">
              {[
                { src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visa/visa-original.svg", alt: "Visa" },
                { src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mastercard/mastercard-original.svg", alt: "Mastercard" },
                { src: "https://raw.githubusercontent.com/gilbarbara/logos/main/logos/amex.svg", alt: "American Express" },
                { src: "https://raw.githubusercontent.com/gilbarbara/logos/main/logos/elo.svg", alt: "Elo" },
                { src: "https://raw.githubusercontent.com/gilbarbara/logos/main/logos/pix.svg", alt: "Pix" },
                { src: "https://raw.githubusercontent.com/gilbarbara/logos/main/logos/hipercard.svg", alt: "Hipercard" },
              ].map(({ src, alt }) => (
                <div key={alt}
                  className="bg-white rounded px-2 py-1 flex items-center justify-center w-12 h-8">
                  <img src={src} alt={alt} className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-verde-claro/50">
          <p>© 2025 Peccato. Todos os direitos reservados.</p>
          <p>De segunda à quinta-feira, das 8h às 18h.</p>
          <p>CNPJ: 26.636.428/0001-19</p>
        </div>
      </div>

    </footer>
  );
}