import { JSX } from "react";

export const SectionUserSupport = (): JSX.Element => {
  return (
    <section className="max-w-xl space-y-1">
      <h3 className="text-lg font-bold">Suporte ao usuário</h3>
      <p className="text-sm text-white/70">
        Está com algum problema ou dúvida sobre a plataforma? Entre em contato:{" "}
        <a
          href="mailto:suporte@junplid.com.br"
          className="text-white underline"
        >
          suporte@junplid.com.br
        </a>
      </p>
    </section>
  );
};
