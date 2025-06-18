import { JSX } from "react";
import { Badge } from "@chakra-ui/react";

export const ReleasesPage: React.FC = (): JSX.Element => {
  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-80px)] scroll-auto overflow-y-auto pr-2">
      <h1 className="font-semibold text-xl">Releases</h1>

      <div className="flex flex-col gap-1">
        <h3>
          <Badge colorPalette={"blue"}>Atual</Badge> v0.6.00
          <span className="text-white/50">-alpha</span> 12/06/2025
        </h3>
        <div className="pl-2">
          <p className="text-green-200">
            + Agentes de inteligência artificial (IA)
          </p>
          <p className="text-white/70 pl-3">
            Crie e gerencie agentes autônomos que usam IA para realizar os
            atendimentos dos seus clientes. Esses agentes podem ser configurados
            para responder a perguntas, fornecer informações e interagir com os
            usuários de forma inteligente e eficiente.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <h3>
          v0.5.00
          <span className="text-white/50">-alpha</span> 05/06/2025
        </h3>
        <div className="pl-2">
          <p className="text-green-200">+ Storage</p>
          <p className="text-white/70 pl-3">
            Armazene e gerencie eficientemente os arquivos dos seus projetos.
            Salve documentos, áudios, vídeos e diversos formatos para suas
            estratégias de marketing e comunicação. Tenha acesso rápido e
            integral a todo o conteúdo que você armazenar.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <h3>
          v0.4.00
          <span className="text-white/50">-alpha</span> 03/06/2025
        </h3>
        <div className="pl-2">
          <p className="text-green-200">
            + Contrutores de fluxos {">"} Bloco de notificar WhatsApp
          </p>
          <p className="text-white/70 pl-3">
            Feito para enviar mensagens de texto para números de WhatsApp
            específicos. Basta adicionar os números desejados e a mensagem que
            você deseja enviar.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <h3>
          v0.3.00
          <span className="text-white/50">-alpha</span> 30/05/2025
        </h3>
        <div className="pl-2">
          <p className="text-green-200">+ Campanhas</p>
          <p className="text-white/70 pl-3">
            Envie mensagens de forma eficiente para seus contatos utilizando
            múltiplas conexões WhatsApp. Basta selecionar as conexões desejadas,
            definir o fluxo de conversa e escolher a velocidade de envio para
            otimizar suas campanhas com máxima praticidade e desempenho.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <h3>
          v0.2.01<span className="text-white/50">-alpha</span> 26/05/2025
        </h3>
        <div className="pl-2">
          <p className="text-orange-200">* Correções</p>
          <p className="text-white/70 pl-3">
            - O fluxo de conversa não era executado corretamente quando o bloco
            "Receber resposta" estava posicionado após o bloco "Inicia fluxo".
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <h3>
          v0.2.00<span className="text-white/50">-alpha</span> 25/05/2025
        </h3>
        <div className="pl-2">
          <p className="text-green-200">
            + Bots de recepção {">"} Palavra-chave de ativação
          </p>
          <p className="text-white/70 pl-3">
            Agora você pode criar bots de recepção que respondem automaticamente
            às mensagens recebidas, ativando-os por meio de palavras-chave
            específicas. Isso permite uma interação mais personalizada e
            eficiente com seus contatos, garantindo que as mensagens sejam
            tratadas de forma adequada e oportuna.
          </p>
        </div>
        <div className="pl-2">
          <p className="text-green-200">
            + Bots de recepção {">"} Fluxo alternativo B
          </p>
          <p className="text-white/70 pl-3">
            Envie outro fluxo de conversa quando uma palavra-chave não for igual
            a mensagem recebida.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <h3>
          v0.1.01<span className="text-white/50">-alpha</span> 23/05/2025
        </h3>
        <div className="pl-2">
          <p className="text-orange-200">* Correções</p>
          <p className="text-white/70 pl-3">
            - Campo de Número Whatsapp que impedia o registro de novas contas.
          </p>
        </div>
      </div>
    </div>
  );
};
