import { JSX } from "react";

export const PrivacyPolicyPage: React.FC = (): JSX.Element => {
  return (
    <div className="flex flex-col p-10 text-sm bg-white text-black">
      <h1 className="font-semibold text-xl">Política de Privacidade</h1>

      <br />
      <p className="font-semibold">1. Introdução</p>
      <p>
        Esta Política descreve como a Plataforma coleta, usa, armazena e
        compartilha seus dados pessoais quando você utiliza nossa plataforma em
        fase alpha gratuita. Nosso objetivo é garantir transparência e cumprir a
        Lei Geral de Proteção de Dados - {"(LGPD, Lei nº 13.709/2018)"}.
      </p>

      <br />
      <p className="font-semibold">2. Dados que Coletamos</p>
      <p>Coletamos apenas os dados estritamente necessários:</p>
      <ul className="list-disc pl-5">
        <li>
          <strong>Cadastro:</strong> nome, CPF ou CNPJ, Número Whatsapp, e-mail
          e senha criptografada.
        </li>
        <li>
          <strong>Conteúdo inserido:</strong> fluxos de conversa, variáveis e
          mensagens criadas por você.
        </li>
        <li>
          <strong>Cookies essenciais:</strong> ID de sessão, preferências de
          idioma e temas.
        </li>
      </ul>
      <p>Não vendemos seus dados pessoais a terceiros.</p>

      <br />
      <p className="font-semibold">
        3. Finalidades do Tratamento e Bases Legais
      </p>
      <p>Usamos seus dados para:</p>
      <ul className="list-disc pl-5">
        <li>
          <strong>Executar o contrato</strong> (art. 7º, V, LGPD): criar e
          gerenciar sua conta, fornecer funcionalidades de automação e salvar
          fluxos.
        </li>
        <li>
          <strong>Legítimo interesse</strong> (art. 7º, IX): melhorar produto,
          detectar falhas e gerar métricas anonimizadas.
        </li>
        <li>
          <strong>Cumprimento legal</strong> (art. 7º, II): responder a ordens
          judiciais ou solicitações da ANPD.
        </li>
      </ul>

      {/* <br />
      <p className="font-semibold">4. Compartilhamento com Terceiros</p>
      <p>
        Compartilhamos dados apenas para viabilizar o serviço ou cumprir a lei:
      </p>
      <ul className="list-disc pl-5">
        <li>
          <strong>Vercel&nbsp;(EUA):</strong> hospedagem do front-end.
        </li>
        <li>
          <strong>Render&nbsp;(EUA):</strong> banco de dados PostgreSQL.
        </li>
        <li>
          <strong>Sentry&nbsp;(EUA):</strong> monitoramento de erros.
        </li>
        <li>
          <strong>Google Analytics 4&nbsp;(EUA):</strong> estatísticas
          anonimizadas (IP truncado).
        </li>
      </ul> */}

      <br />
      <p className="font-semibold">5. Cookies e Tecnologias Semelhantes</p>
      <p>
        Utilizamos cookies <em>estritamente necessários</em> para manter sua
        sessão ativa. Cookies analíticos são opcionais e coletados de forma
        anônima para entender o uso da plataforma. Você pode desativá-los no
        navegador sem impactar funcionalidades essenciais.
      </p>

      <br />
      <p className="font-semibold">6. Retenção e Exclusão de Dados</p>
      <p>
        Mantemos seus dados enquanto a conta estiver ativa e por até 6 meses
        após seu encerramento para auditoria e prevenção de fraudes. Back-ups
        criptografados são mantidos por 30 dias. Após esses prazos, os dados são
        excluídos ou anonimizados.
      </p>

      <br />
      <p className="font-semibold">8. Seus Direitos</p>
      <p>
        Você pode solicitar: confirmação de tratamento, acesso, correção,
        anonimização, portabilidade, eliminação, informação sobre uso de seus
        dados ou oposição ao tratamento realizado sob legítimo interesse. Basta
        solicitar ao suporte. Responderemos em até 15 dias úteis.
      </p>

      <br />
      <p className="font-semibold">9. Crianças e Adolescentes</p>
      <p>
        A plataforma destina-se a maiores de 18 anos. Não coletamos
        intencionalmente dados de menores. Se identificarmos cadastros de
        menores, removeremos prontamente.
      </p>

      <br />
      <p className="font-semibold">10. Alterações desta Política</p>
      <p>
        Podemos atualizar esta Política a qualquer momento. Mudanças relevantes
        serão avisadas por e-mail ou banner na plataforma com 7 dias de
        antecedência. O uso contínuo após esse período indica concordância.
      </p>

      <br />
      <p>
        <strong>
          Ao continuar usando a plataforma, você declara ter lido e entendido
          esta Política de Privacidade.
        </strong>
      </p>
    </div>
  );
};
