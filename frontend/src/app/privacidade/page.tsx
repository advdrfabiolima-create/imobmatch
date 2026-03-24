import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Política de Privacidade | ImobMatch",
  description: "Política de Privacidade e tratamento de dados pessoais conforme a LGPD",
};

export default function PrivacidadePage() {
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
          <h1 className="text-3xl font-bold text-white mb-2">Política de Privacidade</h1>
          <p className="text-white/35 text-sm mb-8">
            Última atualização: março de 2026 · Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei
            nº 13.709/2018)
          </p>

          <div className="space-y-6 text-sm leading-relaxed">

            <section>
              <h2 className="text-base font-semibold text-white/80 mb-3">1. Controlador dos Dados</h2>
              <p className="text-white/50">
                O ImobMatch, operado por <strong className="text-white/70">[Razão Social]</strong>, atua como controlador dos dados pessoais
                coletados na Plataforma, nos termos da LGPD. Para exercer seus direitos ou esclarecer dúvidas, entre
                em contato pelo e-mail:{" "}
                <a href="mailto:privacidade@useimobmatch.com.br" className="text-blue-400 hover:text-blue-300 transition-colors">
                  privacidade@useimobmatch.com.br
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white/80 mb-3">2. Dados Coletados</h2>
              <p className="text-white/50">Coletamos os seguintes tipos de dados:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-white/45">
                <li><strong className="text-white/60">Dados de cadastro:</strong> nome, e-mail, telefone, cidade, estado, imobiliária, CRECI</li>
                <li><strong className="text-white/60">Dados de uso:</strong> imóveis cadastrados, compradores, interações na plataforma</li>
                <li><strong className="text-white/60">Dados técnicos:</strong> endereço IP, tipo de navegador, páginas acessadas (logs de acesso)</li>
                <li><strong className="text-white/60">Dados de imagem:</strong> foto de perfil ou logomarca, fotos de imóveis</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white/80 mb-3">3. Finalidade do Tratamento</h2>
              <p className="text-white/50">Seus dados são utilizados para:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-white/45">
                <li>Criar e gerenciar sua conta na Plataforma</li>
                <li>Realizar o match automático entre compradores e imóveis</li>
                <li>Facilitar parcerias entre corretores</li>
                <li>Enviar comunicações relacionadas ao serviço (transacionais)</li>
                <li>Melhorar a Plataforma com base em dados de uso anonimizados</li>
                <li>Cumprir obrigações legais e regulatórias</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white/80 mb-3">4. Base Legal</h2>
              <p className="text-white/50">O tratamento de dados é realizado com base nas seguintes hipóteses legais da LGPD:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-white/45">
                <li><strong className="text-white/60">Consentimento (art. 7º, I):</strong> para o cadastro e uso da Plataforma</li>
                <li><strong className="text-white/60">Execução de contrato (art. 7º, V):</strong> para prestação dos serviços contratados</li>
                <li><strong className="text-white/60">Legítimo interesse (art. 7º, IX):</strong> para melhoria da Plataforma e prevenção a fraudes</li>
                <li><strong className="text-white/60">Cumprimento de obrigação legal (art. 7º, II):</strong> quando exigido por lei</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white/80 mb-3">5. Compartilhamento de Dados</h2>
              <p className="text-white/50">Seus dados podem ser compartilhados com:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-white/45">
                <li><strong className="text-white/60">Outros corretores na Plataforma:</strong> nome, cidade, imobiliária e CRECI são visíveis para viabilizar parcerias. Dados de compradores (e-mail e telefone) só são visíveis para o corretor responsável.</li>
                <li><strong className="text-white/60">Prestadores de serviço:</strong> infraestrutura em nuvem (Railway, Vercel), armazenamento de imagens (Cloudinary), banco de dados (PostgreSQL)</li>
                <li><strong className="text-white/60">Autoridades:</strong> quando exigido por lei ou ordem judicial</li>
              </ul>
              <p className="mt-2 text-white/45">Não vendemos dados pessoais a terceiros.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white/80 mb-3">6. Retenção de Dados</h2>
              <p className="text-white/50">
                Mantemos seus dados pelo período em que sua conta estiver ativa. Após o encerramento da conta, os
                dados são anonimizados ou excluídos em até 90 dias, salvo obrigação legal de retenção.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white/80 mb-3">7. Segurança</h2>
              <p className="text-white/50">
                Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo criptografia de
                senhas (bcrypt), comunicação via HTTPS, e controles de acesso baseados em função (RBAC). Nenhum
                sistema é 100% seguro; em caso de incidente, notificaremos os titulares conforme a LGPD.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white/80 mb-3">8. Seus Direitos (LGPD, art. 18)</h2>
              <p className="text-white/50">Você tem direito a:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-white/45">
                <li>Confirmar a existência de tratamento de seus dados</li>
                <li>Acessar os dados que possuímos sobre você</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários</li>
                <li>Portabilidade dos dados a outro fornecedor</li>
                <li>Revogar o consentimento a qualquer momento</li>
                <li>Solicitar a exclusão da conta e dos dados associados</li>
              </ul>
              <p className="mt-2 text-white/50">
                Para exercer qualquer desses direitos, envie um e-mail para{" "}
                <a href="mailto:privacidade@useimobmatch.com.br" className="text-blue-400 hover:text-blue-300 transition-colors">
                  privacidade@useimobmatch.com.br
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white/80 mb-3">9. Cookies</h2>
              <p className="text-white/50">
                Utilizamos cookies essenciais para o funcionamento da Plataforma (autenticação e preferências) e
                cookies analíticos anonimizados para melhoria do serviço. Você pode desativar cookies no seu
                navegador, mas isso pode afetar o funcionamento da Plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white/80 mb-3">10. Alterações nesta Política</h2>
              <p className="text-white/50">
                Esta Política pode ser atualizada periodicamente. Alterações relevantes serão comunicadas por e-mail
                ou notificação na Plataforma com antecedência mínima de 15 dias.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-white/80 mb-3">11. Contato e DPO</h2>
              <p className="text-white/50">
                Para questões relacionadas à privacidade e proteção de dados:{" "}
                <a href="mailto:privacidade@useimobmatch.com.br" className="text-blue-400 hover:text-blue-300 transition-colors">
                  privacidade@useimobmatch.com.br
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
