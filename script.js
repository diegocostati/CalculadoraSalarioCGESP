const tabela = [
  { nivel: "I", cat: 1, subs: 17850 },
  { nivel: "I", cat: 2, subs: 18385.50 },
  { nivel: "I", cat: 3, subs: 18937.07 },
  { nivel: "I", cat: 4, subs: 19505.18 },

  { nivel: "II", cat: 1, subs: 20090.33 },
  { nivel: "II", cat: 2, subs: 20693.04 },
  { nivel: "II", cat: 3, subs: 21313.83 },
  { nivel: "II", cat: 4, subs: 21953.25 },

  { nivel: "III", cat: 1, subs: 22611.85 },
  { nivel: "III", cat: 2, subs: 23290.20 },
  { nivel: "III", cat: 3, subs: 23988.91 },
  { nivel: "III", cat: 4, subs: 24708.57 },

  { nivel: "IV", cat: 1, subs: 25449.83 },
  { nivel: "IV", cat: 2, subs: 26213.33 },
  { nivel: "IV", cat: 3, subs: 26999.73 },
  { nivel: "IV", cat: 4, subs: 27809.72 },
];

const PREVIDENCIA_FIXA = 1186.57;
const AUXILIO = 1320;
const DEDUCAO_DEP = 189.59;
const TETO_INSS = 8475.55;
const LIMITE_PREV_COMP = 7.5;

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function popular() {
  const selNivel = document.getElementById("nivel");
  const selCategoria = document.getElementById("categoria");

  selNivel.innerHTML = "";
  selCategoria.innerHTML = "";

  ["I", "II", "III", "IV"].forEach(nivel => {
    const option = document.createElement("option");
    option.value = nivel;
    option.textContent = nivel;
    selNivel.appendChild(option);
  });

  [1, 2, 3, 4].forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    selCategoria.appendChild(option);
  });

  selNivel.value = "I";
  selCategoria.value = "1";
}

function alternarPrevComp() {
  const usaPrevComp = document.getElementById("usaPrevComp").value;
  const campo = document.getElementById("prevComp");

  campo.value = usaPrevComp === "sim" ? 7.5 : 0;

  calcular();
}

function calcularIR(base) {
  if (base <= 2428.80) return 0;
  if (base <= 2826.65) return base * 0.075 - 182.16;
  if (base <= 3751.05) return base * 0.15 - 394.16;
  if (base <= 4664.68) return base * 0.225 - 675.49;
  return base * 0.275 - 908.73;
}

function calcularPrevidenciaRPPSProgressiva(base) {
  let contribuicao = 0;

  const faixas = [
    { limite: 1621.00, aliquota: 0.11 },
    { limite: 4174.58, aliquota: 0.12 },
    { limite: 8475.55, aliquota: 0.14 },
    { limite: Infinity, aliquota: 0.16 }
  ];

  let anterior = 0;

  for (const faixa of faixas) {
    const valorFaixa = Math.min(base, faixa.limite) - anterior;

    if (valorFaixa > 0) {
      contribuicao += valorFaixa * faixa.aliquota;
    }

    anterior = faixa.limite;

    if (base <= faixa.limite) break;
  }

  return contribuicao;
}

function calcular() {
  const nivel = document.getElementById("nivel").value || "I";
  const cat = parseInt(document.getElementById("categoria").value) || 1;
  const regime = document.getElementById("regimePrevidencia").value;

  const iamspePerc = parseFloat(document.getElementById("iamspe").value) / 100;
  const dependentes = parseInt(document.getElementById("dependentes").value) || 0;
  const pensaoPerc = (parseFloat(document.getElementById("pensao").value) || 0) / 100;
  const outros = parseFloat(document.getElementById("outros").value) || 0;

  let prevCompPercentual = parseFloat(document.getElementById("prevComp").value) || 0;

  if (prevCompPercentual > LIMITE_PREV_COMP) {
    prevCompPercentual = LIMITE_PREV_COMP;
    document.getElementById("prevComp").value = LIMITE_PREV_COMP;
  }

  if (prevCompPercentual < 0) {
    prevCompPercentual = 0;
    document.getElementById("prevComp").value = 0;
  }

  const dado = tabela.find(item => item.nivel === nivel && item.cat === cat);

  if (!dado) {
    document.getElementById("resultado").innerHTML = `
      <p>Não foi possível encontrar o nível e categoria selecionados.</p>
    `;
    return;
  }

  const subsidio = dado.subs;

  const previdenciaObrigatoria =
    regime === "pre2013"
      ? calcularPrevidenciaRPPSProgressiva(subsidio)
      : PREVIDENCIA_FIXA;

  const iamspe = subsidio * iamspePerc;
  const pensao = subsidio * pensaoPerc;

  const basePrevComp = Math.max(0, subsidio - TETO_INSS);
  const prevComp = basePrevComp * (prevCompPercentual / 100);
  const contrapartida = prevComp;

  const deducaoDep = dependentes * DEDUCAO_DEP;

  const baseIR =
    subsidio
    - previdenciaObrigatoria
    - iamspe
    - deducaoDep
    - pensao
    - prevComp;

  const ir = Math.max(0, calcularIR(baseIR));

  const liquido =
    subsidio
    - previdenciaObrigatoria
    - iamspe
    - ir
    - pensao
    - prevComp
    - outros;

  const liquidoComAux = liquido + AUXILIO;

  document.getElementById("resultado").innerHTML = `
    <strong>Resultado da simulação</strong><br><br>

    Subsídio: ${formatarMoeda(subsidio)} <br>
    Auxílio Alimentação: ${formatarMoeda(AUXILIO)} <br>
    Regime: ${regime === "pre2013" ? "Antes de 21/01/2013" : "A partir de 21/01/2013"} <br>
    Previdência obrigatória: ${formatarMoeda(previdenciaObrigatoria)} <br>
    IAMSPE: ${formatarMoeda(iamspe)} <br>
    Dedução dependentes: ${formatarMoeda(deducaoDep)} <br>
    Base IR: ${formatarMoeda(baseIR)} <br>
    IR: ${formatarMoeda(ir)} <br>
    Pensão: ${formatarMoeda(pensao)} <br>
    Outros descontos: ${formatarMoeda(outros)} <br><br>

    <strong>Previdência complementar</strong><br>
    Base: ${formatarMoeda(basePrevComp)} <br>
    Percentual: ${prevCompPercentual.toFixed(1).replace(".", ",")}% <br>
    Servidor: ${formatarMoeda(prevComp)} <br>
    Patrocinador: ${formatarMoeda(contrapartida)} <br><br>

    <strong>Salário Líquido: ${formatarMoeda(liquido)}</strong><br>
    <strong>Salário Líquido + Auxílio Alimentação: ${formatarMoeda(liquidoComAux)}</strong>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  calcular();
});
