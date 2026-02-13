import { JSX, useEffect } from "react";

export const TermsOfUsePage: React.FC = (): JSX.Element => {
  useEffect(() => {
    document.title = `Termos de Uso - ${document.title}`;
  }, []);

  return (
    <main
      style={{
        fontFamily: "ui-sans-serif",
      }}
      className="bg-white text-black"
    >
      <header>
        <h1 className="font-extrabold text-2xl">Termos de Uso - Junplid</h1>
        <p>Last updated: 2026-02-07</p>
      </header>
      <br />
      <section>
        <h3 className="font-semibold text-xl">1. VISÃO GERAL</h3>
        <br />
        <p>
          A Junplid Tecnologia Ltda. {"("}“Junplid", “nós”, “plataforma”{")"}
          disponibiliza uma plataforma SaaS que permite a automação e
          gerenciamento de mensagens diretas (DM) do Instagram ou WhatsApp, por
          meio de assistentes de inteligência artificial e atendimento humano,
          utilizando exclusivamente APIs oficiais da Meta(Para instagram) e
          WhatsApp{"("}Via Baileys{")"}. Ao utilizar a plataforma, o usuário
          concorda integralmente com estes Termos de Uso.
        </p>
        <br />
        <hr />
        <br />
        <h3 className="font-semibold">2. ACEITAÇÃO DOS TERMOS</h3>
        <br />
        <p>
          2.1. Ao criar uma conta, acessar ou usar qualquer funcionalidade da
          Junplid, você concorda integralmente com estes Termos de Uso.
        </p>
        <p>
          2.2. Caso o usuário não concorde com qualquer disposição aqui
          prevista, deverá interromper imediatamente o uso da plataforma.
        </p>
        <p>
          2.3. Estes Termos poderão ser atualizados periodicamente. Alterações
          relevantes serão comunicadas por meios razoáveis dentro da plataforma
          ou por e-mail.
        </p>

        <br />
        <h3 className="font-semibold">3. ELEGIBILIDADE E CADASTRO</h3>
        <br />
        <p>
          3.1. O Usuário declara possuir capacidade legal para contratar e/ou
          utilizar a plataforma.
        </p>
        <p>
          3.2. O Usuário compromete-se a fornecer informações verdadeiras no
          cadastro, manter a senha confidencial e notificar imediatamente o
          suporte em caso de uso não autorizado.
        </p>
        <p>
          3.3. O Usuário é responsável por manter a confidencialidade de suas
          credenciais de acesso e por todas as atividades realizadas em sua
          conta.
        </p>
        <p>
          3.4. É extritamente proibido o compartilhamento de credenciais com
          terceiros não autorizados.
        </p>

        <br />
        <h3 className="font-semibold">4. ESCOPO DA PLATAFORMA</h3>
        <br />
        <p>
          4.1. A Junplid oferece ferramentas de automação, criação de fluxos de
          conversa, assitentes de IA{"(Via APIs oficiais da Openai)"} e
          integrações com serviços de mensageria WhatsApp{"(Via Baileys)"} e
          mensagens diretas (DM) do Instagram{"(Via APIs oficiais da Meta)"}.
        </p>
        <p>
          4.2. Todos os recursos são gratuitos, mas podem ser limitados,
          suspensos ou removidos sem aviso.
        </p>
        <p>
          4.3. Recursos pagos poderão ser introduzidos futuramente; o Usuário
          será notificado e poderá escolher migrar ou encerrar a conta.
        </p>

        <br />
        <h3 className="font-semibold">5. USO DA PLATAFORMA</h3>
        <br />
        <p>
          5.1 A Junplid permite que o Usuário conecte contas próprias do
          Instagram e WhatsApp(Via QR Code), previamente autorizadas, para fins
          de automação e atendimento.
        </p>
        <h4>5.2. O Usuário declara que:</h4>
        <ul>
          <li className="pl-2">
            a{")"} É titular ou possui autorização legítima para usar a conta do
            Instagram conectada;
          </li>
          <li className="pl-2">
            b{")"} Possui consentimento de seus clientes finais para envio e
            recebimento de mensagens;
          </li>
          <li className="pl-2">
            c{")"} Utiliza a plataforma em conformidade com as políticas da
            Meta, Instagram e do WhatsApp;
          </li>
        </ul>
        <p>
          5.3 A Junplid não realiza scraping, coleta paralela ou qualquer acesso
          não autorizado a dados do Instagram ou WhatsApp.
        </p>

        <br />
        <h3 className="font-semibold">
          6. AUTOMAÇÃO E INTELIGÊNCIA ARTIFICIAL
        </h3>
        <br />
        <p>
          6.1 A Junplid permite permite a criação de assistentes de IA,
          configurados com informações fornecidas pelo próprio usuário.
        </p>
        <p>
          6.2 As respostas automatizadas refletem exclusivamente as
          configurações definidas pelo usuário.
        </p>
        <h4>6.3. A Junplid não se responsabiliza por:</h4>
        <ul>
          <li className="pl-2">a{")"} Conteúdo das mensagens enviadas;</li>
          <li className="pl-2">
            b{")"} Decisões comerciais tomadas com base nas respostas da IA;
          </li>
          <li className="pl-2">
            c{")"} Uso indevido da automação pelo usuário;
          </li>
        </ul>

        <br />
        <h3 className="font-semibold">7. ATENDIMENTO HUMANO</h3>
        <br />
        <p>
          7.1 A Junplid disponibiliza funcionalidade opcional de atendimento
          humano que é divido em Departamentos, por meio de tickets integrados
          às DMs do Instagram ou WhatsApp(QR Code).
        </p>
        <p>
          7.2 Apenas usuários e agentes autorizados pelo titular da conta
          poderão visualizar e responder mensagens.
        </p>
        <p>
          7.3 O atendimento humano ocorre exclusivamente para fins de suporte,
          vendas ou relacionamento definidos pelo próprio usuário.
        </p>

        <br />
        <h3 className="font-semibold">8. CONDUTAS PROIBIDAS</h3>
        <br />
        <h4>8.1. É expressamente proibido utilizar a Junplid para:</h4>
        <ul>
          <li className="pl-2">
            a{")"} Envio de spam ou mensagens não solicitadas;
          </li>
          <li className="pl-2">b{")"} Práticas fraudulentas ou enganosas;</li>
          <li className="pl-2">c{")"} Violação de direitos de terceiros;</li>
          <li className="pl-2">
            d{")"} Transmitir ou hospedar conteúdo ilegal, ofensivo ou
            discriminatório;
          </li>
          <li className="pl-2">
            e{")"} Qualquer ação que viole as Meta Platform Policies;
          </li>
          <li className="pl-2">
            f{")"} Tentar reverter engenharia, explorar vulnerabilidades ou
            sobrecarregar os servidores;
          </li>
        </ul>
        <p>
          8.2. A violação poderá resultar em suspensão ou encerramento da conta.
        </p>

        <br />
        <h3 className="font-semibold">9. OBRIGAÇÕES DO USUÁRIO</h3>
        <br />
        <p>
          9.1. Utilizar a Plataforma em conformidade com a legislação
          brasileira, especialmente o Marco Civil da Internet{" "}
          {"(Lei 12.965/2014)"} e a LGPD {"(Lei 13.709/2018)"}.
        </p>
        <p>
          9.2. Responsabilizar-se por todas as ações realizadas a partir de sua
          conta.
        </p>

        <br />
        <h3 className="font-semibold">10. PROPRIEDADE INTELECTUAL</h3>
        <br />
        <p>
          10.1. Todo o software, código-fonte, marcas, logotipos e materiais da
          Junplid são de titularidade exclusiva da plataforma ou de seus
          licenciadores.
        </p>
        <p>
          10.2 Estes Termos não concedem qualquer direito de propriedade
          intelectual ao usuário, exceto a licença de uso limitada prevista
          neste documento.
        </p>

        <br />
        <h3 className="font-semibold">11. RESPONSABILIDADE E LIMITAÇÕES</h3>
        <br />
        <p>
          11.1. Na extensão máxima permitida por lei, a responsabilidade total
          da Junplid por quaisquer reivindicações relacionadas à Junplid fica
          limitada a R$ 0,00 {"(zero reais)"}, uma vez que o serviço é gratuito.
        </p>
        <p>
          11.2. Não seremos responsáveis por lucros cessantes, danos indiretos,
          especiais ou consequenciais.
        </p>
        <p>
          11.3. A Junplid não garante que o uso da plataforma resultará em
          aumento de vendas, engajamento ou conversões.
        </p>
        <h4>11.4. A Junplid não se responsabiliza por:</h4>
        <ul>
          <li className="pl-2">
            a{")"} Bloqueios, restrições ou penalidades aplicadas por qualquer
            Serviço de Terceiro ou APIs de terceiros(incluido APIs da Meta);
          </li>
          <li className="pl-2">
            b{")"} Falhas ou indisponibilidades das Serviço de Terceiro ou APIs
            de terceiros(incluido APIs da Meta);
          </li>
          <li className="pl-2">
            c{")"} Conteúdo enviados pelo usuário ou por seus atendentes;
          </li>
        </ul>

        <br />
        <h3 className="font-semibold">12. SUSPENSÃO E RESCISÃO</h3>
        <br />
        <p>
          12.1. A Junplid poderá suspender ou restringir o acesso em caso de:
        </p>
        <ul>
          <li className="pl-2">a{")"} Violação destes Termos;</li>
          <li className="pl-2">b{")"} Uso indevido das APIs da Meta;</li>
          <li className="pl-2">c{")"} Determinação legal ou regulatória;</li>
        </ul>
        <p>12.2. O Usuário pode encerrar sua conta a qualquer momento.</p>
        <p>
          12.3. A Junplid pode rescindir ou suspender o acesso imediatamente em
          caso de violação destes Termos.
        </p>

        <br />
        <h3 className="font-semibold">13. CONFORMIDADE COM A META</h3>
        <br />
        <p>13.1. A Junplid opera em total conformidade com:</p>
        <ul>
          <li className="pl-2">a{")"} Meta Platform Policies;</li>
          <li className="pl-2">b{")"} Instagram Platform Terms;</li>
          <li className="pl-2">c{")"} Data Protection Terms da Meta;</li>
        </ul>
        <p>
          13.2. O Usuário reconhece que o uso indevido da plataforma pode
          resultar em medidas aplicadas diretamente pela Meta, independentemente
          da Junplid.
        </p>

        <br />
        <h3 className="font-semibold">14. ALTERAÇÕES NOS TERMOS</h3>
        <br />
        <p>14.1. Estes Termos podem ser atualizados a qualquer momento.</p>
        <p>
          14.2. Mudanças materiais serão comunicadas por e-mail ou banner dentro
          da Plataforma com 7 dias de antecedência; o uso continuado após esse
          prazo indica concordância com a versão vigente.
        </p>

        <br />
        <h3 className="font-semibold">15. DISPOSIÇÕES GERAIS</h3>
        <br />
        <p>
          15.1. A eventual tolerância de qualquer das partes quanto ao
          descumprimento de obrigações previstas nestes Termos não constituirá
          renúncia, novação ou alteração de direitos, que poderão ser exercidos
          a qualquer tempo.
        </p>
        <p>
          15.2. Caso qualquer disposição destes Termos seja considerada
          inválida, ilegal ou inexequível, no todo ou em parte, tal disposição
          será ajustada na medida necessária, permanecendo as demais cláusulas
          em pleno vigor e eficácia.
        </p>
        <p>
          15.3. A ausência ou atraso no exercício, pela Junplid, de qualquer
          direito previsto nestes Termos não implicará renúncia a tal direito.
        </p>
        <p>
          15.4. Estes Termos não estabelecem qualquer relação de sociedade,
          associação, joint venture, representação, agência, vínculo
          empregatício ou responsabilidade solidária entre as partes.
        </p>
        <p>
          15.5. O Usuário não poderá ceder, transferir ou de qualquer forma
          negociar estes Termos ou os direitos deles decorrentes sem o
          consentimento prévio e por escrito da Junplid.
        </p>
        <p>
          15.6. A Junplid poderá ceder ou transferir estes Termos, no todo ou em
          parte, a qualquer tempo, independentemente de aviso prévio, inclusive
          em casos de reorganização societária, fusão, aquisição ou cessão de
          ativos.
        </p>
        <p>
          15.7. A Junplid poderá enviar comunicações, avisos e notificações ao
          Usuário por e-mail, aplicativo PWA, WhatsApp, notificações in-app ou
          outros meios disponibilizados pela Plataforma.
        </p>
        <p>
          15.8. A Junplid poderá monitorar e registrar o uso da Plataforma, de
          forma proporcional e lícita, com o objetivo de garantir a segurança, a
          estabilidade do sistema e a conformidade com estes Termos e com as
          políticas aplicáveis.
        </p>
        <p>
          15.9. A Junplid poderá utilizar cookies e tecnologias similares,
          estritamente necessários ao funcionamento, segurança, autenticação e
          melhoria da experiência do Usuário, conforme descrito na Política de
          Privacidade.
        </p>
        <p>
          15.10. Informações coletadas de forma agregada ou anonimizada poderão
          ser utilizadas para fins de aprimoramento da Plataforma,
          desenvolvimento de novos recursos e melhorias operacionais.
        </p>
        <p>
          15.11. A Junplid poderá utilizar dados anonimizados para fins de
          pesquisa, desenvolvimento tecnológico e inovação, sem identificação do
          Usuário ou de terceiros.
        </p>
        <p>
          15.12. Dados anonimizados também poderão ser utilizados para análises
          estatísticas, métricas de desempenho e inteligência de negócio.
        </p>
        <p>
          15.13. Informações técnicas poderão ser tratadas para fins de
          segurança da informação, prevenção de incidentes e proteção contra
          acessos não autorizados.
        </p>
        <p>
          15.14. A Junplid poderá tratar dados técnicos e operacionais para fins
          de prevenção a fraudes, abusos e uso indevido da Plataforma, sempre em
          conformidade com a legislação aplicável.
        </p>

        <br />
        <h3 className="font-semibold">16. LEI APLICÁVEL E FORO</h3>
        <br />
        <p>
          16.1. Estes Termos são regidos pelas leis da República Federativa do
          Brasil.
        </p>
        <p>
          16.2. Fica eleito o foro da comarca do domicílio da Junplid, salvo
          disposição legal em contrário.
        </p>

        <br />
        <h3 className="font-semibold">17. SUPORTE E CONTATO</h3>
        <br />
        <p>
          Endereço: Rua Paulo Gonçalves da Silva, 75 - Valéria, Salvador - BA -
          Brasil.
        </p>
        <p>E-mail: suporte@junplid.com.br</p>
        <h3 className="font-semibold">Junplid - All rights reserved.</h3>
      </section>

      <br />
      <footer>
        <p>
          <strong>
            Ao continuar usando a Plataforma, você declara ter lido e entendido
            estes Termos de Uso.
          </strong>
        </p>
      </footer>
    </main>
  );
};
