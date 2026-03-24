import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Termos de Uso | ImobMatch",
  description: "Termos de Uso da plataforma ImobMatch",
};

export default function TermosPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #060c1a 0%, #0a1228 50%, #080e1f 100%)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b"
        style={{ background: "rgba(6,12,26,0.85)", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="transition-opacity hover:opacity-70">
            <Image src="/logo_texto_branco.png" alt="ImobMatch" width={120} height={32} className="h-5 w-auto object-contain" />
          </Link>
          <Link href="/login" className="text-sm text-white/40 hover:text-white/70 transition-colors font-medium">
            Voltar para o login
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div
          className="rounded-2xl border p-8 sm:p-12"
          style={{
            background: "rgba(255,255,255,0.02)",
            borderColor: "rgba(255,255,255,0.08)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Termos de Uso</h1>
          <p className="text-white/35 text-sm mb-8">Última atualização: março de 2026</p>

          <div className="space-y-6 text-sm leading-relaxed">

            <section>
              <h2 className="text-base font-semibold text-white/80 mb-3">1. Aceitação dos Termos</h2>
              <p className="text-white/50">
                Ao acessar ou utilizar a plataforma ImobMatch ("Plataforma"), você concorda com estes Termos de Uso
                ("Termos"). Se você não concordar com alguma parte destes Termos, não utilize a Plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white/80 mb-3">2. Descrição do Serviço</h2>
              <p className="text-white/50">O ImobMatch é uma plataforma digital destinada a corretores de imóveis e imobiliárias, que oferece:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-white/45">
                <li>Cadastro e gestão de imóveis e compradores</li>
                <li>Sistema automático de match entre compradores e imóveis</li>
                <li>Rede colaborativa de parcerias entre corretores</li>
                <li>Importação de dados de imóveis via link</li>
                <li>Gestão de comunicação entre parceiros</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white/80 mb-3">3. Cadastro e Conta</h2>
              <p className="text-white/50">
                Para utilizar a Plataforma, você deve criar uma conta fornecendo informações verdadeiras, precisas e
                atualizadas. Você é responsável por manter a confidencialidade da sua senha e por todas as atividades
                realizadas em sua conta.
              </p>
              <p className="mt-2 text-white/50">
                O ImobMatch se reserva o direito de suspender ou encerrar contas que violem estes Termos ou que
                utilizem informações falsas.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white/80 mb-3">4. Uso Aceitável</h2>
              <p className="text-white/50">Ao utilizar a Plataforma, você concorda em:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-white/45">
                <li>Utilizar a Plataforma apenas para fins legais e relacionados à atividade imobiliária</li>
                <li>Não publicar informações falsas, enganosas ou fraudulentas sobre imóveis</li>
                <li>Respeitar os dados e a privacidade dos demais usuários</li>
                <li>Não realizar engenharia reversa, scraping ou acesso não autorizado à Plataforma</li>
                <li>Não compartilhar credenciais de acesso com terceiros</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white/80 mb-3">5. Conteúdo do Usuário</h2>
              <p className="text-white/50">
                Você retém a propriedade do conteúdo que publica na Plataforma (imóveis, fotos, descrições). Ao
                publicar conteúdo, você concede ao ImobMatch uma licença não exclusiva, gratuita e mundial para
                exibir e distribuir esse conteúdo dentro da Plataforma.
              </p>
              <p className="mt-2 text-white/50">
                Você declara que possui todos os direitos necessários sobre o conteúdo publicado e que este não viola
                direitos de terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white/80 mb-3">6. Parcerias e Comissões</h2>
              <p className="text-white/50">
                As parcerias entre corretores são acordos realizados diretamente entre os usuários. O ImobMatch atua
                como facilitador tecnológico e não é parte em nenhuma transação imobiliária. Questões relacionadas a
                comissões, honorários e divisão de receitas são de responsabilidade exclusiva dos corretores envolvidos.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white/80 mb-3">7. Planos e Pagamentos</h2>
              <p className="text-white/50">
                A Plataforma oferece planos gratuitos e pagos. As condições de cada plano estão descritas na página
                de Planos. O ImobMatch se reserva o direito de alterar preços e condições com aviso prévio de 30
                dias aos usuários afetados.
              </p>
            </section>

            {/* ── AVISO EM DESTAQUE ── */}
            <section
              className="rounded-xl border-2 p-6"
              style={{
                background: "rgba(245,158,11,0.08)",
                borderColor: "rgba(245,158,11,0.30)",
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">⚠️</span>
                <div className="space-y-3 text-sm leading-relaxed">
                  <h2 className="text-base font-bold text-amber-400">
                    Isenção de Responsabilidade por Transações Imobiliárias
                  </h2>
                  <p className="text-amber-200/60">
                    A <strong className="text-amber-200/80">ImobMatch</strong> é uma{" "}
                    <strong className="text-amber-200/80">plataforma de publicidade e intermediação tecnológica</strong>,
                    destinada exclusivamente a profissionais do mercado imobiliário. Nos termos dos arts. 186 e 927 do
                    Código Civil Brasileiro (Lei nº 10.406/2002) e do art. 3º do Código de Defesa do Consumidor (Lei nº
                    8.078/1990), a ImobMatch{" "}
                    <strong className="text-amber-200/80">não é parte integrante, mandante, interveniente, garante ou avalista</strong>{" "}
                    em quaisquer negociações, contratos de compra e venda, locação, permuta, cessão de direitos ou qualquer
                    outra modalidade de transação imobiliária realizadas entre os usuários da Plataforma.
                  </p>
                  <p className="text-amber-200/60">
                    Todo e qualquer negócio jurídico celebrado entre corretores, compradores, vendedores, locatários ou
                    demais partes é de{" "}
                    <strong className="text-amber-200/80">responsabilidade exclusiva dos envolvidos</strong>. A condução,
                    o assessoramento técnico e a formalização das transações são atribuições do corretor de imóveis
                    devidamente habilitado perante o CRECI de sua unidade federativa, nos termos da Lei Federal nº
                    6.530/1978 e do Decreto nº 81.871/1978, que regulamentam o exercício da profissão.
                  </p>
                  <p className="text-amber-200/60">
                    A ImobMatch <strong className="text-amber-200/80">não realiza</strong> avaliações de imóveis, não
                    emite laudos de vistoria, não verifica a regularidade urbanística, cartorial ou tributária dos imóveis
                    anunciados, e não garante a veracidade, completude ou atualidade das informações publicadas pelos
                    usuários. A pesquisa e análise de certidões são de responsabilidade integral das partes contratantes.
                  </p>
                  <p className="text-amber-200/60">
                    Eventuais litígios decorrentes de vícios ocultos, inadimplemento contratual, disputas possessórias,
                    irregularidades documentais ou quaisquer outros danos oriundos das negociações realizadas por meio dos
                    anúncios publicados na Plataforma devem ser resolvidos{" "}
                    <strong className="text-amber-200/80">diretamente entre as partes</strong>, sem envolvimento ou
                    responsabilização da ImobMatch.
                  </p>
                  <p className="text-xs text-amber-200/35 italic">
                    Este aviso tem fundamento nos princípios da boa-fé objetiva (art. 422 do CC), na teoria da
                    responsabilidade civil subjetiva (art. 927 do CC) e no Marco Civil da Internet (Lei nº 12.965/2014,
                    art. 19).
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white/80 mb-3">8. Limitação de Responsabilidade</h2>
              <p className="text-white/50">
                Sem prejuízo do disposto na seção anterior, o ImobMatch não se responsabiliza por perdas ou danos
                decorrentes de: (i) uso ou impossibilidade de uso da Plataforma; (ii) informações incorretas publicadas
                por usuários; (iii) transações realizadas entre usuários; (iv) falhas de conectividade; (v) acesso não
                autorizado à conta por negligência do usuário; (vi) decisões tomadas com base em informações da Plataforma.
              </p>
              <p className="mt-2 text-white/50">
                A responsabilidade total da ImobMatch, em qualquer hipótese admitida em lei, fica limitada ao valor pago
                pelo usuário à Plataforma nos últimos 3 (três) meses anteriores ao evento gerador do dano.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white/80 mb-3">9. Modificações nos Termos</h2>
              <p className="text-white/50">
                O ImobMatch pode atualizar estes Termos periodicamente. Alterações significativas serão comunicadas
                por e-mail ou notificação na Plataforma. O uso continuado após as alterações constitui aceitação dos
                novos Termos.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white/80 mb-3">10. Foro e Legislação</h2>
              <p className="text-white/50">
                Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da Comarca de São Paulo/SP
                para dirimir eventuais controvérsias.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white/80 mb-3">11. Contato</h2>
              <p className="text-white/50">
                Para dúvidas sobre estes Termos, entre em contato pelo e-mail:{" "}
                <a href="mailto:contato@useimobmatch.com.br" className="text-blue-400 hover:text-blue-300 transition-colors">
                  contato@useimobmatch.com.br
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
