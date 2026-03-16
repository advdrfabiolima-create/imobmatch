import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Política de Privacidade | ImobMatch",
  description: "Política de Privacidade e tratamento de dados pessoais conforme a LGPD",
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.png" alt="ImobMatch" width={140} height={40} className="h-9 w-auto object-contain" />
          </Link>
          <Link href="/login" className="text-sm text-blue-600 hover:underline font-medium">
            Voltar para o login
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
          <p className="text-gray-500 text-sm mb-8">
            Última atualização: março de 2026 · Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei
            nº 13.709/2018)
          </p>

          <div className="prose prose-gray max-w-none space-y-6 text-sm text-gray-700 leading-relaxed">

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Controlador dos Dados</h2>
              <p>
                O ImobMatch, operado por <strong>[Razão Social]</strong>, atua como controlador dos dados pessoais
                coletados na Plataforma, nos termos da LGPD. Para exercer seus direitos ou esclarecer dúvidas, entre
                em contato pelo e-mail:{" "}
                <a href="mailto:privacidade@useimobmatch.com.br" className="text-blue-600 hover:underline">
                  privacidade@useimobmatch.com.br
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Dados Coletados</h2>
              <p>Coletamos os seguintes tipos de dados:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  <strong>Dados de cadastro:</strong> nome, e-mail, telefone, cidade, estado, imobiliária, CRECI
                </li>
                <li>
                  <strong>Dados de uso:</strong> imóveis cadastrados, compradores, interações na plataforma
                </li>
                <li>
                  <strong>Dados técnicos:</strong> endereço IP, tipo de navegador, páginas acessadas (logs de acesso)
                </li>
                <li>
                  <strong>Dados de imagem:</strong> foto de perfil ou logomarca, fotos de imóveis
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Finalidade do Tratamento</h2>
              <p>Seus dados são utilizados para:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Criar e gerenciar sua conta na Plataforma</li>
                <li>Realizar o match automático entre compradores e imóveis</li>
                <li>Facilitar parcerias entre corretores</li>
                <li>Enviar comunicações relacionadas ao serviço (transacionais)</li>
                <li>Melhorar a Plataforma com base em dados de uso anonimizados</li>
                <li>Cumprir obrigações legais e regulatórias</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Base Legal</h2>
              <p>O tratamento de dados é realizado com base nas seguintes hipóteses legais da LGPD:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  <strong>Consentimento (art. 7º, I):</strong> para o cadastro e uso da Plataforma
                </li>
                <li>
                  <strong>Execução de contrato (art. 7º, V):</strong> para prestação dos serviços contratados
                </li>
                <li>
                  <strong>Legítimo interesse (art. 7º, IX):</strong> para melhoria da Plataforma e prevenção a fraudes
                </li>
                <li>
                  <strong>Cumprimento de obrigação legal (art. 7º, II):</strong> quando exigido por lei
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Compartilhamento de Dados</h2>
              <p>Seus dados podem ser compartilhados com:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  <strong>Outros corretores na Plataforma:</strong> nome, cidade, imobiliária e CRECI são visíveis
                  para viabilizar parcerias. Dados de compradores (e-mail e telefone) só são visíveis para o corretor
                  responsável.
                </li>
                <li>
                  <strong>Prestadores de serviço:</strong> infraestrutura em nuvem (Railway, Vercel), armazenamento
                  de imagens (Cloudinary), banco de dados (PostgreSQL)
                </li>
                <li>
                  <strong>Autoridades:</strong> quando exigido por lei ou ordem judicial
                </li>
              </ul>
              <p className="mt-2">Não vendemos dados pessoais a terceiros.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Retenção de Dados</h2>
              <p>
                Mantemos seus dados pelo período em que sua conta estiver ativa. Após o encerramento da conta, os
                dados são anonimizados ou excluídos em até 90 dias, salvo obrigação legal de retenção.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Segurança</h2>
              <p>
                Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo criptografia de
                senhas (bcrypt), comunicação via HTTPS, e controles de acesso baseados em função (RBAC). Nenhum
                sistema é 100% seguro; em caso de incidente, notificaremos os titulares conforme a LGPD.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Seus Direitos (LGPD, art. 18)</h2>
              <p>Você tem direito a:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Confirmar a existência de tratamento de seus dados</li>
                <li>Acessar os dados que possuímos sobre você</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários</li>
                <li>Portabilidade dos dados a outro fornecedor</li>
                <li>Revogar o consentimento a qualquer momento</li>
                <li>Solicitar a exclusão da conta e dos dados associados</li>
              </ul>
              <p className="mt-2">
                Para exercer qualquer desses direitos, envie um e-mail para{" "}
                <a href="mailto:privacidade@useimobmatch.com.br" className="text-blue-600 hover:underline">
                  privacidade@useimobmatch.com.br
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Cookies</h2>
              <p>
                Utilizamos cookies essenciais para o funcionamento da Plataforma (autenticação e preferências) e
                cookies analíticos anonimizados para melhoria do serviço. Você pode desativar cookies no seu
                navegador, mas isso pode afetar o funcionamento da Plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Alterações nesta Política</h2>
              <p>
                Esta Política pode ser atualizada periodicamente. Alterações relevantes serão comunicadas por e-mail
                ou notificação na Plataforma com antecedência mínima de 15 dias.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Contato e DPO</h2>
              <p>
                Para questões relacionadas à privacidade e proteção de dados:{" "}
                <a href="mailto:privacidade@useimobmatch.com.br" className="text-blue-600 hover:underline">
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
