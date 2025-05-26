import { JSX } from "react";

export const TermsOfServicePage: React.FC = (): JSX.Element => {
  return (
    <div className="flex flex-col p-10 text-sm bg-white text-black">
      <h1 className="font-semibold text-xl">Termos de Serviço</h1>
      <p className="text-xs text-gray-600">
        Versão 0.1.00-alpha - Vigente a partir de 25 de maio de 2025
      </p>

      <br />
      <p className="font-semibold">1. Aceitação dos Termos</p>
      <p>
        1.1. Ao criar uma conta, acessar ou usar qualquer funcionalidade da
        plataforma {"(doravante “Plataforma”)"}, você concorda integralmente com
        estes Termos e Condições de Uso {"(“Termos”)"}.
      </p>
      <p>1.2. Caso não concorde, interrompa imediatamente o uso.</p>

      <br />
      <p className="font-semibold">2. Escopo da Plataforma</p>
      <p>
        2.1. A Plataforma oferece ferramentas de automação, criação de fluxos de
        conversa e integrações com serviços de mensageria{" "}
        {"(ex.: WhatsApp via Baileys)"}.
      </p>
      <p>
        2.2. Nesta fase beta, todos os recursos são gratuitos, mas podem ser
        limitados, suspensos ou removidos sem aviso.
      </p>
      <p>
        2.3. Recursos pagos poderão ser introduzidos futuramente; o Usuário será
        notificado e poderá escolher migrar ou encerrar a conta.
      </p>
      <br />
      <p className="font-semibold">3. Elegibilidade e Conta</p>
      <p>3.1. É necessário ter pelo menos 18 anos e capacidade civil plena.</p>
      <p>
        3.2. O Usuário compromete-se a fornecer informações verdadeiras no
        cadastro, manter a senha confidencial e notificar imediatamente o
        suporte em caso de uso não autorizado.
      </p>

      <br />
      <p className="font-semibold">
        4. Ambiente Beta & Isenção de Responsabilidade
      </p>
      <p>
        4.1. Software beta é fornecido “no estado em que se encontra”{" "}
        {"(“as is”)"}, sem garantias de disponibilidade, desempenho ou ausência
        de falhas.
      </p>
      <p>4.2. A plataforma não se responsabiliza por:</p>
      <ul>
        <li className="pl-2">a{")"} perda de dados inseridos na plataforma;</li>
        <li className="pl-2">b{")"} interrupções de serviço;</li>
        <li className="pl-2">
          c{")"} danos diretos ou indiretos decorrentes do uso ou da
          impossibilidade de uso.
        </li>
      </ul>
      <p>
        4.3. O Usuário reconhece que deve manter backups externos e não depender
        da Plataforma para operações críticas durante o beta.
      </p>
      <p>
        4.4. A plaatforma reserva-se o direito de encerrar o beta a qualquer
        momento, sem aviso prévio.
      </p>
      <p>
        4.5. O Usuário concorda em não responsabilizar a plataforma por
        quaisquer danos decorrentes do uso da Plataforma durante a varsão alpha.
      </p>

      <br />
      <p className="font-semibold">5. Obrigações do Usuário</p>
      <p>
        5.1. Utilizar a Plataforma em conformidade com a legislação brasileira,
        especialmente o Marco Civil da Internet {"(Lei 12.965/2014)"} e a LGPD{" "}
        {"(Lei 13.709/2018)"}.
      </p>
      <p>
        5.2. Não transmitir ou hospedar conteúdo ilícito, ofensivo, difamatório,
        violento ou protegido por direitos autorais sem autorização.
      </p>
      <p>
        5.3. Não tentar reverter engenharia, explorar vulnerabilidades ou
        sobrecarregar os servidores.
      </p>
      <p>
        5.4. Responsabilizar-se por todas as ações realizadas a partir de sua
        conta.
      </p>

      <br />
      <p className="font-semibold">6. Propriedade Intelectual</p>
      <p>
        6.2. É vedado copiar, modificar, distribuir ou criar obras derivadas sem
        consentimento escrito.
      </p>

      <br />
      <p className="font-semibold">7. Privacidade e Dados Pessoais</p>
      <p>
        7.1. Durante o beta coletamos apenas os dados estritamente necessários
        para operar {"(nome, e-mail, logs técnicos)"}.
      </p>
      <p>
        7.2. Esses dados são armazenados em servidores localizados no Brasil,
        seguindo boas práticas de segurança.
      </p>
      <p>
        7.3. Para fins de melhoria contínua, métricas de uso anonimizadas podem
        ser analisadas.
      </p>
      <p>
        7.4. O Usuário pode requisitar a exclusão definitiva de seus dados
        entrando em contato com suporte.
      </p>

      <br />
      <p className="font-semibold">8. Alterações nos Termos</p>
      <p>8.1. Estes Termos podem ser atualizados a qualquer momento.</p>
      <p>
        8.2. Mudanças materiais serão comunicadas por e-mail ou banner dentro da
        Plataforma com 7 dias de antecedência; o uso continuado após esse prazo
        indica concordância.
      </p>

      <br />
      <p className="font-semibold">9. Suspensão ou Encerramento</p>
      <p>
        9.1. A Plataforma pode suspender ou excluir contas que violem estes
        Termos, a legislação aplicável ou comprometam a estabilidade do serviço.
      </p>
      <p>
        9.2. O Usuário pode encerrar a conta a qualquer momento nas
        configurações ou solicitando via suporte.
      </p>

      <br />
      <p className="font-semibold">10. Limitação de Responsabilidade</p>
      <p>
        10.1. Na extensão máxima permitida por lei, a responsabilidade total da
        Plataforma por quaisquer reivindicações relacionadas à Plataforma fica
        limitada a R$ 0,00 {"(zero reais)"}, uma vez que o serviço é gratuito em
        fase beta.
      </p>
      <p>
        10.2. Não seremos responsáveis por lucros cessantes, danos indiretos,
        especiais ou consequenciais.
      </p>

      <br />
      <p className="font-semibold">13. Disposições Gerais</p>
      <p>
        13.1. Estes Termos constituem o entendimento completo entre as partes e
        substituem quaisquer acordos anteriores.
      </p>
      <p>
        13.2. Se qualquer disposição destes Termos for considerada inválida ou
        inexequível, as demais disposições permanecerão em pleno vigor.
      </p>
      <p>
        13.3. A falha da Plataforma em exercer qualquer direito ou disposição
        destes Termos não constituirá renúncia a tal direito ou disposição.
      </p>
      <p>
        13.4. Estes Termos não criam qualquer relação de sociedade, joint
        venture ou agência entre as partes.
      </p>
      <p>
        13.5. O Usuário não pode ceder ou transferir estes Termos sem o
        consentimento prévio por escrito da Plataforma.
      </p>
      <p>
        13.6. A Plataforma pode ceder ou transferir estes Termos a qualquer
        momento, sem aviso prévio.
      </p>
      <p>
        13.7. Estes Termos são vinculativos e em benefício das partes e seus
        sucessores.
      </p>
      <p>
        13.8. O Usuário concorda que a Plataforma pode enviar notificações por
        e-mail ou por meio da Plataforma.
      </p>
      <p>
        13.9. O Usuário concorda que a Plataforma pode monitorar o uso da
        Plataforma para garantir conformidade com estes Termos.
      </p>
      <p>
        13.10. O Usuário concorda que a Plataforma pode usar cookies e
        tecnologias semelhantes para coletar informações sobre o uso da
        Plataforma.
      </p>
      <p>
        13.11. O Usuário concorda que a Plataforma pode usar informações
        coletadas para melhorar a Plataforma e oferecer novos recursos.
      </p>
      <p>
        13.12. O Usuário concorda que a Plataforma pode usar informações
        coletadas para fins de marketing, desde que não identifiquem o Usuário.
      </p>
      <p>
        13.13. O Usuário concorda que a Plataforma pode usar informações
        coletadas para fins de pesquisa e desenvolvimento, desde que não
        identifiquem o Usuário.
      </p>
      <p>
        13.14. O Usuário concorda que a Plataforma pode usar informações
        coletadas para fins de análise de dados, desde que não identifiquem o
        Usuário.
      </p>
      <p>
        13.15. O Usuário concorda que a Plataforma pode usar informações
        coletadas para fins de segurança, desde que não identifiquem o Usuário.
      </p>
      <p>
        13.16. O Usuário concorda que a Plataforma pode usar informações
        coletadas para fins de prevenção de fraudes, desde que não identifiquem
        o Usuário.
      </p>

      <br />
      <p className="font-semibold">12. Suporte e Contato</p>
      <p>Dúvidas, sugestões ou reclamações? Fale conosco:</p>
      <p>
        Discord:{" "}
        <a
          href="https://discord.gg/2C4Uu8DPVb"
          className="text-blue-600 underline"
        >
          Suporte e comunidade
        </a>
      </p>
      <p>Horário de atendimento: 09 h - 18 h {"(GMT-3)"}, dias úteis.</p>

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
