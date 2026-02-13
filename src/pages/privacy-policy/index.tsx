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
        <p>Last updated: 2026-02-07</p>
      </header>
      <br />
      <section>
        <h3 className="font-semibold">1. INTRODUÇÃO</h3>
        <br />
        <p>
          Esta política descreve como a Junplid coleta, usa, armazena e
          compartilha seus dados pessoais. Nosso objetivo é garantir
          transparência e cumprir a Lei Geral de Proteção de Dados -{" "}
          {"(LGPD, Lei nº 13.709/2018)"}.
        </p>
        <br />

        <hr />

        <br />
        <h3 className="font-semibold">2. PRINCÍPIOS DE PRIVACIDADE</h3>
        <br />
        <p>2.1. A Junplid adota os princípios de:</p>
        <ul className="list-disc pl-5">
          <li>Finalidade;</li>
          <li>
            Necessidade {"("}mínima coleta{")"};
          </li>
          <li>Transparência;</li>
          <li>Segurança;</li>
          <li>Responsabilização;</li>
        </ul>
        <p>
          2.2. Não coletamos dados desnecessários e não comercializamos dados
          pessoais.
        </p>

        <br />
        <h3 className="font-semibold">3. DADOS COLETADOS</h3>
        <br />
        <p>
          3.1. Dados do usuário para criação de conta na plataforma
          {"(Junplid)"}:
        </p>
        <ul className="list-disc pl-5">
          <li>Nome do usuário</li>
          <li>E-mail</li>
          <li>Senha</li>
          <li>Dados de faturamento{"(quando aplicável)"}</li>
        </ul>
        <p>3.2. Dados para criação de integração com WhatsApp:</p>
        <ul className="list-disc pl-5">
          <li>Nome da conta</li>
          <li>Descrição (opcional)</li>
        </ul>
        <p>
          3.2.1. Dados opcionais de configuração do perfil da conta WhatsApp:
        </p>
        <ul className="list-disc pl-5">
          <li>Imagem de perfil</li>
          <li>Nome do perfil</li>
          <li>Recado</li>
          <li>
            Configurações de privacidade da foto de perfil{" "}
            {'("Todos", "Meus contatos" ou "Ninguém")'}
          </li>
          <li>
            Configurações de privacidade para adição em grupos{" "}
            {'("Todos" ou "Meus contatos")'}
          </li>
        </ul>
        <p>3.3. Dados para criação de bot de recepção:</p>
        <ul className="list-disc pl-5">
          <li>Nome</li>
          <li>Descrição {"(opcional)"}</li>
          <li>Palavra chave de ativação {"(opcional)"}</li>
          <li>Horários de operação {"(opcional)"}</li>
        </ul>
        <p>3.4. Dados para criação de assistentes de IA:</p>
        <ul className="list-disc pl-5">
          <li>
            Credenciais do provedor: Chave secreta{"(secret key)"} da OpenAI
          </li>
          <li>Nome do provedor{"(OpenAI)"}</li>
          <li>Nome do assistente de IA</li>
          <li>Personalidade {"(opcional)"}</li>
          <li>Modelo de IA</li>
          <li>Temperatura {"(opcional)"}</li>
          <li>Segundos esperando resposta {"(opcional)"}</li>
          <li>Limitador de frequência {"(opcional)"}</li>
          <li>Base de conhecimento {"(opcional)"}</li>
          <li>Instruções do assistente {"(opcional)"}</li>
          <li>Horários de operação {"(opcional)"}</li>
        </ul>
        <p>
          3.5. Dados para criação de departamento
          {"(Chat interno de suporte humano)"}:
        </p>
        <ul className="list-disc pl-5">
          <li>Nome</li>
        </ul>
        <p>3.6. Bancada de trabalho{"(Workbench)"}:</p>
        <p>
          3.6.1. Dados para criação de variáveis: das variaveis são coletadas e
          onde são usadas
        </p>
        <ul className="list-disc pl-5">
          <li>Nome</li>
          <li>Tipo{'("Mutável" ou "Imutável")'}</li>
          <li>Valor{"(Obrigatorio quando o tipo for Imutável)"}</li>
        </ul>
        <p>3.6.2. Dados para criação de etiqueta/tag:</p>
        <ul className="list-disc pl-5">
          <li>Nome</li>
        </ul>
        <p>3.6.3. Storage - Dados de documentos, áudios, e outros formatos:</p>
        <ul className="list-disc pl-5">
          <li>Upload de arquivo{"(s)"}</li>
        </ul>
        <p>3.6.4. Dados para criação de construtor de fluxos:</p>
        <ul className="list-disc pl-5">
          <li>Nome</li>
        </ul>
        <p>3.6.4.1. Dados para automação de fluxo de conversa</p>

        <p>3.7. Integrações externas:</p>
        <p>
          3.7.1. Dados para criação de integração de pagamentos com Mercado
          Pago:
        </p>
        <ul className="list-disc pl-5">
          <li>Nome da integração</li>
          <li>Credenciais{"(Token de acesso e Webhook Secret)"}</li>
        </ul>
        <p>3.7.2. Dados para criação de integração com Trello:</p>
        <ul className="list-disc pl-5">
          <li>Nome da integração</li>
          <li>Credenciais{"(Chave de API e Token de acesso)"}</li>
        </ul>

        <br />
        <h3 className="font-semibold">4. FINALIDADE DO TRATAMENTO</h3>
        <p>4.1. Os dados são utilizados exclusivamente para:</p>
        <ul className="list-disc pl-5">
          <li>
            Legítimo interesse (art. 7º, IX): melhorar produto, detectar falhas
            e gerar métricas anonimizadas.
          </li>
          <li>
            Cumprimento legal (art. 7º, II): responder a ordens judiciais ou
            solicitações da ANPD.
          </li>
          <li>Executar automações de chat para WhatsApp.</li>
          <li>Permitir atendimento humano solicitado.</li>
          <li>Operar assistentes de IA configurados pelo usuário.</li>
          <li>Garantir segurança, auditoria e prevenção de fraudes.</li>
        </ul>

        <br />
        <h3 className="font-semibold">5. SEGURANÇA DA INFORMAÇÃO</h3>
        <p>5.1. Todos os dados sensíveis são protegidos por:</p>
        <ul className="list-disc pl-5">
          <li>Criptografia ponta a ponta.</li>
          <li>Criptografia em repouso (AES-256 ou superior).</li>
          <li>Criptografia em trânsito (TLS 1.2+).</li>
        </ul>

        <br />
        <h3 className="font-semibold">6. COMPARTILHAMENTO DE DADOS</h3>
        <p>6.1. Os dados não são vendidos nem utilizados para publicidade.</p>
        <p>6.2. O compartilhamento ocorre apenas quando necessário com:</p>
        <ul className="list-disc pl-5">
          <li>Infraestrutura de nuvem.</li>
          <li>Serviços essenciais de IA.</li>
          <li>
            Dados configurados pelo usuário por meio de variáveis definidas pelo
            usuário nos fluxos de conversa.
          </li>
        </ul>

        <br />
        <h3 className="font-semibold">7. RETENÇÃO E EXCLUSÃO</h3>
        <p>
          7.1. Os dados são mantidos apenas pelo tempo necessário à execução do
          serviço.
        </p>
        <p>
          7.2. Após o cancelamento da conta, os dados são excluídos ou
          anonimizados em até 60 dias, salvo obrigações legais.
        </p>

        <br />
        <h3 className="font-semibold">8. Cookies e Tecnologias Semelhantes</h3>
        <p>
          8.1. Utilizamos cookies <em>estritamente necessários</em> para manter
          sua sessão ativa. Cookies analíticos são opcionais e coletados de
          forma anônima para entender o uso da plataforma.
        </p>

        <br />
        <h3 className="font-semibold">9. DIREITOS DO TITULAR</h3>
        <p>
          9.1. Você pode solicitar: confirmação de tratamento, acesso, correção,
          anonimização, portabilidade, eliminação, informação sobre uso de seus
          dados ou oposição ao tratamento realizado sob legítimo interesse.
          Basta solicitar ao suporte. Responderemos em até 15 dias úteis.
        </p>

        <br />
        <h3 className="font-semibold">10. CRIANÇAS E ADOLESCENTES</h3>
        <p>
          10.1. A plataforma destina-se a maiores de 18 anos. Não coletamos
          intencionalmente dados de menores. Se identificarmos cadastros de
          menores, removeremos prontamente.
        </p>

        <br />
        <h3 className="font-semibold">11. ATUALIZAÇÕES</h3>
        <p>11.1. Podemos atualizar esta Política a qualquer momento.</p>
        <p>
          11.2. Mudanças serão comunicadas por e-mail ou banner dentro da
          Plataforma com 7 dias de antecedência; o uso continuado após esse
          prazo indica concordância com a versão vigente.
        </p>

        <br />
        <h3 className="font-semibold">12. SUPORTE E CONTATO</h3>
        <br />
        <p>
          Endereço: Rua Paulo Gonçalves da Silva, 75 - Valéria, Salvador - BA -
          Brasil.
        </p>
        <p>E-mail: suporte@junplid.com.br</p>
        <h3 className="font-semibold">Junplid - All rights reserved.</h3>

        <br />
        <p>
          <strong>
            Ao continuar usando a plataforma, você declara ter lido e entendido
            esta Política de Privacidade.
          </strong>
        </p>
      </section>
    </main>
  );
};
