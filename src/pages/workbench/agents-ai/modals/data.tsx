export const optionsModels = [
  {
    label: <span>gpt-5.2</span>,
    value: "gpt-5.2",
    isFlex: true,
    isPriority: true,
    searchFile: true,
    desc: "O modelo mais avançado para trabalho profissional e agentes de longa duração.",
  },
  {
    label: <span>gpt-5.1</span>,
    value: "gpt-5.1",
    isFlex: true,
    searchFile: true,
    isPriority: true,
    desc: "Altíssimo desempenho; ótimo para trabalhos exigentes.",
  },
  {
    label: <span>gpt-5</span>,
    value: "gpt-5",
    isFlex: true,
    isPriority: true,
    searchFile: true,
    desc: "Muito capaz; atende necessidades profissionais e negócios.",
  },
  {
    label: <span>gpt-5-mini</span>,
    value: "gpt-5-mini",
    isFlex: true,
    isPriority: true,
    searchFile: true,
    desc: "Boa qualidade com menor custo; ideal para uso diário.",
  },
  {
    label: <span>gpt-5-nano</span>,
    value: "gpt-5-nano",
    isFlex: true,
    isPriority: false,
    searchFile: true,
    desc: "Rápido e barato; para tarefas simples e frequentes.",
  },
  {
    label: <span>o3</span>,
    value: "o3",
    isFlex: true,
    isPriority: true,
    searchFile: true,
    desc: "Equilíbrio entre custo e desempenho; confiável para rotinas.",
  },
  {
    label: <span>o4-mini</span>,
    value: "o4-mini",
    isFlex: true,
    isPriority: true,
    searchFile: true,
    desc: "Leve e rápido; bom para respostas rápidas.",
  },
  {
    label: <span>gpt-4.1</span>,
    value: "gpt-4.1",
    isFlex: false,
    isPriority: true,
    searchFile: true,
    desc: "Estável e preciso; ideal para textos longos.",
  },
  {
    label: <span>gpt-4.1-mini</span>,
    value: "gpt-4.1-mini",
    isFlex: false,
    searchFile: true,
    isPriority: true,
    desc: "Boa qualidade por menos custo; para uso constante.",
  },
  {
    label: <span>gpt-4.1-nano</span>,
    value: "gpt-4.1-nano",
    isFlex: false,
    searchFile: true,
    isPriority: true,
    desc: "Muito rápido e econômico; para respostas curtas.",
  },
  {
    label: <span>o3-mini</span>,
    value: "o3-mini",
    isFlex: false,
    searchFile: true,
    isPriority: false,
    desc: "Versão econômica; atende grande volume com custo baixo.",
  },
];

export const optionsModelsTrans = [
  {
    label: <span>gpt-4o-transcribe</span>,
    value: "gpt-4o-transcribe",
  },
  {
    label: <span>gpt-4o-mini-transcribe</span>,
    value: "gpt-4o-mini-transcribe",
  },
];

export const optionsEmojiLevel = [
  { label: "None", value: "none" },
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

export const optionsPrivacyValue = [
  { label: "Todos", value: "all" },
  { label: "Meus contatos", value: "contacts" },
  // { label: "Todos", value: "contact_blacklist" },
  { label: "Ninguém", value: "none" },
];

export const optionsPrivacyGroupValue = [
  { label: "Todos", value: "all" },
  { label: "Meus contatos", value: "contacts" },
  // { label: "Todos", value: "contact_blacklist" },
  // { label: "Ninguém", value: "none" },
];

export const optionsOpertaingDays = [
  { label: "Domingo", value: 0 },
  { label: "Segunda-feira", value: 1 },
  { label: "Terça-feira", value: 2 },
  { label: "Quarta-feira", value: 3 },
  { label: "Quinta-feira", value: 4 },
  { label: "Sexta-feira", value: 5 },
  { label: "Sábado", value: 6 },
];
