import { JSX, useEffect } from "react";

export const PrivacyPolicyPage: React.FC = (): JSX.Element => {
  useEffect(() => {
    document.title = `Pólitica de Privacidade - ${document.title}`;
  }, []);

  return (
    <main
      style={{
        fontFamily: "ui-sans-serif",
      }}
      className="bg-white text-black"
    >
      <header>
        <h1 className="font-extrabold text-2xl">
          Política de Privacidade - Junplid
        </h1>
        <p>Última atualização: 17 de fevereiro de 2026</p>
      </header>
      <br />
      <section>
        <h3 className="font-semibold">1. INTRODUÇÃO</h3>
        <br />
        <p>
          A Junplid valoriza a privacidade, a proteção de dados pessoais e a
          transparência no tratamento das informações. Esta Política descreve
          como coletamos, utilizamos, armazenamos, compartilhamos e protegemos
          dados pessoais no contexto da utilização da plataforma.
        </p>
        <br />
        <p>
          O tratamento de dados é realizado em conformidade com a Lei nº
          13.709/2018 {"(LGPD)"} e demais normas aplicáveis.
        </p>
        <br />
        <p>
          Ao utilizar a plataforma, o usuário declara estar ciente das práticas
          descritas nesta Política.
        </p>
        <br />

        <hr />

        <br />

        <h3 className="font-semibold">2. CONTROLADOR DOS DADOS</h3>
        <p>
          2.1. A Junplid atua como Controladora dos dados pessoais tratados na
          plataforma.
        </p>
        <p>
          Endereço: Rua Paulo Gonçalves da Silva, 75 - Valéria, Salvador - BA -
          Brasil.
        </p>
        <p>E-mail: suporte@junplid.com.br</p>

        <br />
        <h3 className="font-semibold">3. DADOS PESSOAIS COLETADOS</h3>
        <p>
          Coletamos apenas os dados necessários para a prestação dos serviços.
        </p>
        <br />
        <p>3.1. Dados para criação de conta na plataforma {"(Junplid)"}</p>
        <ul className="list-disc pl-5">
          <li>Nome</li>
          <li>Número de telefone</li>
          <li>E-mail {"(armazenada de forma criptografada e anonimizada)"}</li>
          <li>Senha {"(armazenada de forma criptografada)"}</li>
          <li>Dados de faturamento{"(quando aplicável)"}</li>
        </ul>
        <p>Base legal: Execução de contrato (art. 7º, V da LGPD).</p>
        <br />
        <p>3.2. Conteúdos Inseridos pelo Usuário</p>
        <p>
          A plataforma permite que o usuário configure fluxos, assistentes,
          integrações, variáveis, automações, mensagens, arquivos e demais
          estruturas operacionais.
        </p>
        <p>
          Esses conteúdos podem incluir dados pessoais inseridos pelo próprio
          usuário, inclusive dados de terceiros (como clientes ou contatos).
        </p>
        <p>
          Nesses casos, a Junplid atua como operadora desses dados, tratando-os
          exclusivamente para:
        </p>
        <ul className="list-disc pl-5">
          <li>Execução das funcionalidades contratadas</li>
          <li>Processamento de mensagens</li>
          <li>Atendimento automatizado ou humano</li>
          <li>
            Armazenamento técnico necessário ao funcionamento da plataforma
          </li>
        </ul>
        <p>
          A Junplid não utiliza tais dados para fins publicitários próprios nem
          realiza comercialização de informações pessoais.
        </p>
        <br />
        <p>3.3. Dados Decorrentes de Integrações com Serviços de Mensageria</p>
        <p>
          A plataforma pode permitir integração com serviços de mensageria para
          envio e recebimento de mensagens automatizadas.
        </p>
        <p>Podem ser tratados:</p>
        <ul className="list-disc pl-5">
          <li>Conteúdo das mensagens enviadas e recebidas</li>
          <li>Identificadores técnicos necessários à comunicação</li>
          <li>
            Metadados relacionados à entrega e processamento das mensagens
          </li>
        </ul>
        <p>
          Esses dados são utilizados exclusivamente para viabilizar o
          funcionamento das automações configuradas pelo usuário.
        </p>
        <br />
        <p>3.4. Integrações com Terceiros</p>
        <p>
          A plataforma pode permitir integrações com serviços externos, tais
          como:{" "}
        </p>
        <p>Podem ser tratados:</p>
        <ul className="list-disc pl-5">
          <li>Gateways de pagamento</li>
          <li>Ferramentas de gestão</li>
          <li>Provedores de infraestrutura em nuvem</li>
          <li>Provedores de inteligência artificial</li>
          <li>APIs oficiais de plataformas digitais, quando aplicável</li>
        </ul>
        <p>
          Nessas hipóteses, pode ocorrer compartilhamento de dados estritamente
          necessário para execução do serviço contratado.
        </p>
        <p>
          Quando aplicável, poderá haver transferência internacional de dados,
          observadas as garantias legais adequadas previstas na legislação
          vigente.
        </p>
        <br />
        <p>3.5. Dados Técnicos e de Segurança</p>
        <p>
          Também podem ser tratados dados técnicos necessários para operação e
          segurança da plataforma, tais como:
        </p>
        <ul className="list-disc pl-5">
          <li>Endereço IP</li>
          <li>Logs de acesso</li>
          <li>Identificadores de sessão</li>
          <li>Informações de dispositivo e navegador</li>
        </ul>
        <p>Esses dados são utilizados para:</p>
        <ul className="list-disc pl-5">
          <li>Garantir segurança da informação</li>
          <li>Prevenir fraudes</li>
          <li>Manter estabilidade e desempenho da plataforma</li>
        </ul>

        <br />
        <h3 className="font-semibold">4. FINALIDADE DO TRATAMENTO</h3>
        <p>
          Os dados pessoais ou de terceiros inseridos pelo usuário são tratados
          para:
        </p>
        <ul className="list-disc pl-5">
          <li>Executar os serviços contratados</li>
          <li>Permitir automações e atendimento humano</li>
          <li>Operar assistentes de IA</li>
          <li>Garantir segurança da informação</li>
          <li>Cumprir obrigações legais</li>
          <li>Prevenir fraudes</li>
          <li>Melhorar a plataforma por meio de métricas anonimizadas</li>
        </ul>
        <p>Bases legais aplicáveis:</p>
        <ul className="list-disc pl-5">
          <li>Execução de contrato {"(art. 7º, V - LGPD)"}</li>
          <li>Cumprimento de obrigação legal {"(art. 7º, II - LGPD)"}</li>
          <li>Legítimo interesse {"(art. 7º, IX - LGPD)"}</li>
        </ul>

        <br />
        <h3 className="font-semibold">5. DADOS PROVENIENTES DA META</h3>
        <p>
          Quando o usuário integra sua conta à Instagram Direct Messages (Graph
          API) ou outras APIs oficiais da Meta, podemos receber dados
          necessários para o funcionamento das integrações autorizadas, tais
          como:
        </p>
        <ul className="list-disc pl-5">
          <li>Conteúdo das mensagens enviadas e recebidas</li>
          <li>Identificadores de conta e perfil relacionados à integração</li>
          <li>
            Metadados necessários para entrega e processamento das mensagens
          </li>
        </ul>
        <p>Esses dados são utilizados exclusivamente para:</p>
        <ul className="list-disc pl-5">
          <li>Operar a integração com Instagram DM</li>
          <li>Executar fluxos e automações configuradas pelo usuário</li>
          <li>Permitir atendimento automatizado ou humano, quando aplicável</li>
        </ul>
        <p>
          5.1. A Junplid não utiliza esses dados para fins publicitários
          próprios nem realiza a comercialização de informações pessoais.
        </p>
        <p>
          5.2. O tratamento está sujeito aos termos e políticas da Meta, bem
          como às normas de proteção de dados aplicáveis.
        </p>
        <p>
          5.3. O usuário pode solicitar a exclusão de dados associados à sua
          conta a qualquer momento{" "}
          <a className="text-blue-500 underline" href="#DATA_DELETION_REQUEST">
            {"(ver Seção 10)"}
          </a>
          .
        </p>

        <br />
        <h3 className="font-semibold">6. COMPARTILHAMENTO DE DADOS</h3>
        <p>6.1. Os dados não são vendidos nem utilizados para publicidade.</p>
        <p>6.2. O compartilhamento ocorre apenas quando necessário com:</p>
        <ul className="list-disc pl-5">
          <li>Provedores de infraestrutura em nuvem</li>
          <li>Provedores de IA</li>
          <li>Gateways de pagamento</li>
          <li>Serviços essenciais de integração</li>
        </ul>
        <p>
          6.3. Todos os parceiros são contratualmente obrigados a manter padrões
          adequados de segurança e confidencialidade.
        </p>

        <br />
        <h3 className="font-semibold">7. SEGURANÇA DA INFORMAÇÃO</h3>
        <p>Todos os dados sensíveis são protegidos por:</p>
        <ul className="list-disc pl-5">
          <li>Criptografia ponta a ponta.</li>
          <li>Criptografia em repouso (AES-256 ou superior).</li>
          <li>Criptografia em trânsito (TLS 1.2+).</li>
        </ul>

        <br />
        <h3 className="font-semibold">8. RETENÇÃO E EXCLUSÃO</h3>
        <p>Os dados são mantidos apenas pelo tempo necessário para:</p>
        <ul className="list-disc pl-5">
          <li>Execução do contrato</li>
          <li>Cumprimento de obrigações legais</li>
          <li>Exercício regular de direitos</li>
        </ul>
        <p>
          8.1. Após o cancelamento da conta, os dados são excluídos ou
          anonimizados em até 60 dias, salvo obrigações legais.
        </p>

        <br />
        <h3 className="font-semibold">9. DIREITOS DO TITULAR</h3>
        <p>Nos termos da LGPD, o titular pode solicitar:</p>
        <ul className="list-disc pl-5">
          <li>Confirmação da existência de tratamento</li>
          <li>Acesso aos dados</li>
          <li>Correção</li>
          <li>Anonimização</li>
          <li>Portabilidade</li>
          <li>Eliminação</li>
          <li>Informação sobre compartilhamentos</li>
          <li>Revogação de consentimento</li>
          <li>Oposição ao tratamento baseado em legítimo interesse</li>
        </ul>
        <p>9.1. Solicitações devem ser enviadas para: suporte@junplid.com.br</p>
        <p>9.2. Prazo de resposta: até 15 dias úteis.</p>

        <br />
        <h3 id="DATA_DELETION_REQUEST" className="font-semibold">
          10. PROCEDIMENTO DE EXCLUSÃO DE DADOS (DATA DELETION REQUEST)
        </h3>
        <p>Usuários que desejarem excluir seus dados podem:</p>
        <ul className="list-disc pl-5">
          <li>Solicitar pelo e-mail suporte@junplid.com.br</li>
          <li>Informar o e-mail cadastrado na plataforma</li>
          <li>Confirmar a identidade</li>
          <li></li>
        </ul>
        <p>
          10.1. A exclusão será realizada em até 60 dias, salvo obrigações
          legais.
        </p>

        <br />
        <h3 className="font-semibold">11. COOKIES E TECNOLOGIAS SEMELHANTES</h3>
        <p>
          11.1. Utilizamos cookies <em>estritamente necessários</em> para manter
          sua sessão ativa. Cookies analíticos são opcionais e coletados de
          forma anônima para entender o uso da plataforma.
        </p>
        <p>
          11.2. O usuário pode gerenciar preferências diretamente no navegador.
        </p>
        <br />

        <h3 className="font-semibold">12. CRIANÇAS E ADOLESCENTES</h3>
        <p>
          12.1. A plataforma destina-se a maiores de 18 anos. Não coletamos
          intencionalmente dados de menores. Se identificarmos cadastros de
          menores, removeremos prontamente.
        </p>

        <br />

        <h3 className="font-semibold">13. TRANSFERÊNCIA INTERNACIONAL</h3>
        <p>
          13.1. Os dados podem ser processados fora do Brasil por provedores
          contratados, incluindo empresas de tecnologia e infraestrutura,
          observadas as garantias legais adequadas previstas na LGPD.
        </p>

        <br />
        <h3 className="font-semibold">14. ATUALIZAÇÕES</h3>
        <p>14.1. Podemos atualizar esta Política a qualquer momento.</p>
        <p>
          14.2. Mudanças serão comunicadas por e-mail ou banner dentro da
          Plataforma com 7 dias de antecedência; o uso continuado após esse
          prazo indica concordância com a versão vigente.
        </p>

        <br />
        <h3 className="font-semibold">15. DISPOSIÇÕES FINAIS</h3>
        <p>
          15.1. A Junplid não comercializa dados pessoais e não realiza
          tratamento para fins publicitários próprios.
        </p>
        <p>
          15.2. Ao utilizar a plataforma, o usuário declara ter lido e
          compreendido esta Política de Privacidade.
        </p>

        <br />
        <h3 className="font-semibold">16. SUPORTE E CONTATO</h3>
        <p>
          Endereço: Rua Paulo Gonçalves da Silva, 75 - Valéria, Salvador - BA -
          Brasil.
        </p>
        <p>E-mail: suporte@junplid.com.br</p>
        <h3 className="font-semibold">Junplid - All rights reserved.</h3>
      </section>
    </main>
  );
};
