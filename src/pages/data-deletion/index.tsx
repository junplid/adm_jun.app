export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-[#1a1c1c] text-gray-200 px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Solicitação de Exclusão de Dados - Junplid
        </h1>

        <p className="mb-6 text-gray-300 leading-relaxed">
          A Junplid permite que qualquer usuário solicite a exclusão de seus
          dados pessoais a qualquer momento.
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">
            🔹 Como solicitar a exclusão:
          </h2>

          <ol className="list-decimal list-inside space-y-3 text-gray-300">
            <li>Acesse sua conta na plataforma Junplid.</li>
            <li>
              Vá até <strong>Configurações</strong> {">"} <strong>Conta</strong>
              .
            </li>
            <li>
              Clique em <strong>Deletar permanentemente</strong>.
            </li>
            <li>Confirme a solicitação.</li>
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Após a confirmação:</h2>

          <ul className="list-disc list-inside space-y-3 text-gray-300">
            <li>Sua conta será desativada imediatamente.</li>
            <li>
              Os dados associados serão excluídos permanentemente em até 60
              dias, salvo obrigações legais de retenção.
            </li>
            <li>
              Integrações com Instagram serão automaticamente desvinculadas.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            🔹 Caso não tenha mais acesso à conta:
          </h2>

          <p className="mb-4 text-gray-300">Envie um e-mail para:</p>

          <p className="mb-4">
            <a
              href="mailto:suporte@junplid.com.br"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              suporte@junplid.com.br
            </a>
          </p>

          <p className="mb-4 text-gray-300">
            Com o assunto: <strong>“Solicitação de Exclusão de Dados”</strong>
          </p>

          <p className="mb-4 text-gray-300">Inclua:</p>

          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Nome da conta</li>
            <li>E-mail ou telefone cadastrado</li>
          </ul>

          <p className="mt-6 text-gray-400">
            Responderemos em até 5 dias úteis.
          </p>
        </section>
      </div>
    </div>
  );
}
