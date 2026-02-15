import { FiCheckCircle } from "react-icons/fi";

export default function FarewellPage() {
  return (
    <div className="min-h-screen flex py-10 items-center justify-center bg-linear-to-br from-neutral-900 to-neutral-900 px-6">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
          <FiCheckCircle className="h-10 w-10 text-emerald-400" />
        </div>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-white">
          Conta deletada com sucesso
        </h1>
        <p className="mb-6 text-lg text-slate-300">
          Todos os dados associados à sua conta foram removidos de forma
          permanente e segura.
        </p>
        <div className="mb-8 rounded-xl border border-white/10 bg-black/20 p-6 text-slate-300">
          <p>
            Sentimos muito por ver você deixando a{" "}
            <span className="font-medium text-white">Junplid</span>.
          </p>
          <p className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-400">
            Foi um prazer ter você com a gente ❤️
          </p>
        </div>
      </div>
    </div>
  );
}
