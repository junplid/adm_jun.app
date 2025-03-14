import {
  // AiOutlineApi,
  // AiOutlineAudio,
  // AiOutlineBranches,
  // AiOutlineCalculator,
  // AiOutlineCheckCircle,
  // AiOutlineClockCircle,
  // AiOutlineEnvironment,
  // AiOutlineFile,
  // AiOutlineFilePdf,
  // AiOutlineFlag,
  // AiOutlineLineChart,
  // AiOutlineLink,
  // AiOutlineMail,
  // AiOutlineMessage,
  // AiOutlineNotification,
  // AiOutlinePicture,
  // AiOutlinePlayCircle,
  // AiOutlineQuestionCircle,
  // AiOutlineSearch,
  AiOutlineSend,
  // AiOutlineSwitcher,
  // AiOutlineVideoCamera,
} from "react-icons/ai";
import { BsBoxes } from "react-icons/bs";
import { FiClipboard } from "react-icons/fi";
import { MdOutlinePermMedia } from "react-icons/md";
import { TbToolsOff } from "react-icons/tb";
import { TiFlowChildren } from "react-icons/ti";
import { TypesNodes } from "@contexts/flow.context";
import { JSX } from "react";
import "./styles.css";

interface PropsToolBarComponent_I {
  onClickItem(item: TypesNodes): void;
}

export default function ToolBarFlowComponent(
  props: PropsToolBarComponent_I
): JSX.Element {
  return (
    <div className="bg-secondary absolute right-0 top-0 flex -translate-x-3 translate-y-3 flex-col items-center justify-center text-white shadow-lg shadow-black/50 duration-300">
      {/* BLOCOS PADRÃO */}
      <div className="group relative w-full">
        <div
          style={{ transform: "translateX(-10px)" }}
          className="fixed right-20 top-0 hidden min-h-full -translate-x-2 group-hover:flex"
        >
          <div
            style={{ background: "#107c38" }}
            className="mr-4 w-72 overflow-hidden rounded-lg"
          >
            <h2 className="bg-green-600 p-3 text-lg font-semibold shadow">
              Blocos padrão
            </h2>
            <ul className="w-full">
              <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeMessage")}
                  className="flex w-full items-center gap-x-1 p-2 py-3 hover:bg-green-800/80"
                >
                  <AiOutlineSend size={25} />
                  <span className="text-start text-lg">Envio de texto</span>
                </button>
              </li>
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeReply")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 hover:bg-green-800/80"
                >
                  <AiOutlineMessage size={25} />
                  <span className="text-start text-lg">Receber resposta</span>
                </button>
              </li>
              <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeMenu")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 hover:bg-green-800/80"
                >
                  <TfiMenuAlt size={25} />
                  <span className="text-start text-lg">Menu</span>
                </button>
              </li> */}
            </ul>
          </div>
        </div>
        <button
          type="button"
          className="flex w-full flex-col items-center gap-y-2 rounded-t-lg bg-green-700 p-1 py-2 group-hover:bg-green-600/80"
        >
          <BsBoxes size={25} className="force-icon-white" />
          <span className="text-center text-sm">
            <small className="text-xs text-white/80">Blocos</small>
            <br />
            Padrão
          </span>
        </button>
      </div>
      {/* FIM BLOCOS PADRÃO */}

      {/* BLOCOS DE MIDIA */}
      <div className="group relative w-full">
        <div
          style={{ transform: "translateX(-10px)" }}
          className="fixed right-20 top-0 hidden min-h-full -translate-x-2 group-hover:flex"
        >
          <div className="mr-4 w-72 overflow-hidden rounded-lg bg-yellow-700">
            <h2 className="bg-yellow-600 p-3 text-lg font-semibold shadow">
              Blocos de mídia
            </h2>
            <ul className="w-full">
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeSendContact")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 duration-200 hover:bg-yellow-800/80"
                >
                  <FaRegAddressCard className="force-fff-gr" size={25} />
                  <span className="text-start text-lg">Enviar contato</span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeSendVideo")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 duration-200 hover:bg-yellow-800/80"
                >
                  <AiOutlineVideoCamera className="force-fff-gr" size={25} />
                  <span className="text-start text-lg">Enviar vídeo</span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeSendAudio")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 duration-200 hover:bg-yellow-800/80"
                >
                  <AiOutlineAudio className="force-fff-gr" size={25} />
                  <span className="text-start text-lg">Enviar áudio</span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeSendImage")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 duration-200 hover:bg-yellow-800/80"
                >
                  <AiOutlinePicture className="force-fff-gr" size={25} />
                  <span className="text-start text-lg">Enviar imagem</span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeSendPdf")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 duration-200 hover:bg-yellow-800/80"
                >
                  <AiOutlineFilePdf className="force-fff-gr" size={25} />
                  <span className="text-start text-lg">Enviar pdf</span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeSendLink")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 duration-200 hover:bg-yellow-800/80"
                >
                  <AiOutlineLink className="force-fff-gr" size={25} />
                  <span className="text-start text-lg">Enviar link</span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeSendFile")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 duration-200 hover:bg-yellow-800/80"
                >
                  <AiOutlineFile className="force-fff-gr" size={25} />
                  <span className="text-start text-lg">Enviar arquivo</span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeSendLocationGPS")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 duration-200 hover:bg-yellow-800/80"
                >
                  <AiOutlineEnvironment className="force-fff-gr" size={25} />
                  <span className="text-start text-lg">Enviar localização</span>
                </button>
              </li> */}
            </ul>
          </div>
        </div>
        <button
          type="button"
          className="flex w-full flex-col items-center gap-y-2 bg-yellow-700 p-1 py-2 group-hover:bg-yellow-600/80"
        >
          <MdOutlinePermMedia size={30} className="force-icon-white" />

          <span className="text-center text-sm">
            <small className="text-xs text-white/80">Blocos de</small>
            <br />
            Mídia
          </span>
        </button>
      </div>
      {/* FIM BLOCOS DE MIDIA */}

      {/* BLOCOS LOGICOS */}
      <div className="group relative w-full">
        <div
          style={{
            transform: "translateX(-10px)",
          }}
          className="fixed right-20 top-0 hidden min-h-full -translate-x-2 group-hover:flex"
        >
          <div className="mr-4 w-72 overflow-hidden rounded-lg bg-blue-700">
            <h2 className="bg-blue-600 p-3 text-lg font-semibold shadow">
              Blocos lógicos
            </h2>
            <ul className="w-full">
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeLogicalCondition")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 duration-200 hover:bg-blue-800/80"
                >
                  <AiOutlineQuestionCircle className="force-fff-gr" size={25} />
                  <span className="text-start text-lg">Condição lógica</span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeSwitch")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 duration-200 hover:bg-blue-800/80"
                >
                  <AiOutlineSwitcher className="force-fff-gr" size={25} />
                  <span className="text-start text-lg">Switch</span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeDistributeFlow")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 duration-200 hover:bg-blue-800/80"
                >
                  <AiOutlineBranches className="force-fff-gr" size={25} />
                  <span className="text-start text-lg">Distribuir fluxo</span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeMathematicalOperators")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 duration-200 hover:bg-blue-800/80"
                >
                  <AiOutlineCalculator className="force-fff-gr" size={30} />
                  <span className="text-start text-lg">
                    Operadores matemáticos/data
                  </span>
                </button>
              </li> */}
            </ul>
          </div>
        </div>
        <button
          type="button"
          className="flex w-full flex-col items-center gap-y-2 bg-blue-700 p-1 py-2 group-hover:bg-blue-500/70"
        >
          <TiFlowChildren size={35} className="force-icon-white" />

          <span className="text-center text-sm">
            <small className="text-xs text-white/80">Blocos</small>
            <br />
            Lógicos
          </span>
        </button>
      </div>
      {/* FIM BLOCOS LOGICOS */}

      {/* BLOCOS DE QUALIFICAÇÃO */}
      <div className="group relative w-full">
        <div
          style={{
            transform: "translateX(-10px)",
          }}
          className="fixed right-20 top-0 hidden min-h-full -translate-x-2 group-hover:flex"
        >
          <div className="mr-4 w-72 overflow-hidden rounded-lg bg-orange-700">
            <h2 className="bg-orange-600 p-3 text-lg font-semibold shadow">
              Blocos de atendimento
            </h2>
            <ul className="w-full">
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeSendHumanService")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 duration-200 hover:bg-orange-800/80"
                >
                  <div>
                    <FaUserFriends className="force-fff-gr" size={25} />
                  </div>
                  <span className="text-start text-lg">Atendimento humano</span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeAttendantAI")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 duration-200 hover:bg-orange-800/80"
                >
                  <div>
                    <TbRobot size={25} />
                  </div>
                  <span className="text-start text-lg">
                    Tarefa atendente IA
                  </span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button
                  onClick={() =>
                    props.onClickItem("nodeInsertLeaderInAudience")
                  }
                  className="flex items-center w-full p-3 py-4 duration-200 hover:bg-orange-800/80 gap-x-2"
                >
                  <div>
                    <GrDirections className="force-fff-gr" size={25} />
                  </div>
                  <span className="text-lg text-start">
                    Inserir lead em um público
                  </span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeWebform")}
                  className="flex items-center w-full p-3 py-4 duration-200 hover:bg-orange-800/80 gap-x-2"
                >
                  <div>
                    <GrDirections className="force-fff-gr" size={25} />
                  </div>
                  <span className="text-lg text-start">Automação HTTP</span>
                </button>
              </li> */}
            </ul>
          </div>
        </div>
        <button
          type="button"
          className="flex w-full flex-col items-center gap-y-2 bg-orange-700 p-1 py-2 group-hover:bg-orange-500/70"
        >
          <FiClipboard size={30} className="force-icon-white" />

          <span className="text-center text-sm">
            <small className="text-xs text-white/80">Blocos de</small>
            <br />
            Atendimento
          </span>
        </button>
      </div>
      {/* FIM BLOCOS DE QUALIFICAÇÃO */}

      {/* BLOCOS DE SERVIÇOS */}
      <div className="group relative w-full">
        <div
          style={{
            transform: "translateX(-10px)",
          }}
          className="fixed right-20 top-0 hidden min-h-full -translate-x-2 group-hover:flex"
        >
          <div className="mr-4 w-72 overflow-hidden rounded-lg bg-pink-700">
            <h2 className="bg-pink-600 p-3 text-lg font-semibold shadow">
              Blocos de serviços
            </h2>
            <ul className="w-full">
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeWebhook")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 hover:bg-pink-800/80"
                >
                  <AiOutlineApi className="force-fff-gr" size={25} />
                  <span className="text-start text-lg">Webhook</span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeEmailSending")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 hover:bg-pink-800/80"
                >
                  <AiOutlineMail className="force-fff-gr" size={25} />
                  <span className="text-start text-lg">Envio de E-mail</span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeFacebookConversions")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 hover:bg-pink-800/80"
                >
                  <LiaFacebookF className="force-fff-gr" size={25} />
                  <span className="text-start text-lg">
                    Conversões do facebook
                  </span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeNotifyNumber")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 duration-200 hover:bg-pink-800/80"
                >
                  <AiOutlineNotification className="force-fff-gr" size={25} />
                  <span className="text-start text-lg">Notificar números</span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeNewCardTrello")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 duration-200 hover:bg-pink-800/80"
                >
                  <div>
                    <FaTrello className="force-fff-gr" size={25} />
                  </div>
                  <span className="text-start text-lg">
                    Novo card no Trello
                  </span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeLinkTranckingPixel")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 hover:bg-pink-800/80"
                >
                  <AiOutlineSearch className="force-fff-gr" size={25} />
                  <span className="text-start text-lg">Link de rastreio</span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button
                  onClick={() =>
                    props.onClickItem("nodeInterruptionLinkTrackingPixel")
                  }
                  className="flex w-full items-center gap-x-2 p-3 py-4 hover:bg-pink-800/80"
                >
                  <AiOutlineLineChart className="force-fff-gr" size={25} />
                  <span className="text-start text-lg">
                    Reação do link de rastreio
                  </span>
                </button>
              </li> */}
            </ul>
          </div>
        </div>
        <button
          type="button"
          className="flex w-full flex-col items-center gap-y-2 bg-pink-700 p-1 py-2 group-hover:bg-pink-500/70"
        >
          <FiClipboard size={30} className="force-icon-white" />

          <span className="text-center text-sm">
            <small className="text-xs text-white/80">Blocos de</small>
            <br />
            Serviços
          </span>
        </button>
      </div>
      {/* BLOCOS DE SERVIÇOS */}

      {/* BLOCOS DE FERRAMENTAS */}
      <div className="group relative w-full">
        <div
          style={{
            transform: "translateX(-10px)",
          }}
          className="fixed right-20 top-0 hidden min-h-full -translate-x-2 group-hover:flex"
        >
          <div className="mr-4 w-72 overflow-hidden rounded-lg bg-purple-700">
            <h2 className="bg-purple-600 p-3 text-lg font-semibold shadow">
              Blocos de Ferramentas
            </h2>
            <ul className="w-full">
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeValidation")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 hover:bg-green-800/80"
                >
                  <AiOutlineCheckCircle size={25} />
                  <span className="text-start text-lg">Validação</span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeAction")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 hover:bg-purple-800/80"
                >
                  <AiOutlinePlayCircle className="force-fff-gr" size={25} />
                  <span className="text-start text-lg">Ação</span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeCheckPoint")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 hover:bg-purple-800/80"
                >
                  <AiOutlineFlag className="force-fff-gr" size={25} />
                  <span className="text-start text-lg">Check point</span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button className="flex w-full cursor-not-allowed items-center gap-x-2 p-3 py-4 text-white/40 hover:bg-purple-800/80">
                  <BsSignStop className="force-fff-gr" size={25} />
                  <span className="text-start text-lg">Interrupção</span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeTime")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 hover:bg-green-800/80"
                >
                  <AiOutlineClockCircle size={25} />
                  <span className="text-start text-lg">Tempo</span>
                </button>
              </li> */}
              {/* <li className="w-full">
                <button
                  onClick={() => props.onClickItem("nodeRemark")}
                  className="flex w-full items-center gap-x-2 p-3 py-4 hover:bg-green-800/80"
                >
                  <LiaComment size={25} />
                  <span className="text-start text-lg">Comentário</span>
                </button>
              </li> */}
            </ul>
          </div>
        </div>
        <button
          type="button"
          className="flex w-full flex-col items-center gap-y-2 rounded-b-lg bg-purple-700 p-1 py-2 group-hover:bg-purple-500/70"
        >
          <TbToolsOff size={34} />

          <span className="text-center text-sm">
            <small className="text-xs text-white/80">Blocos de</small>
            <br />
            Ferramentas
          </span>
        </button>
      </div>
      {/* FIM BLOCOS DE FERRAMENTAS */}
    </div>
  );
}
