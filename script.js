const tabela = [
  {nivel:"I",cat:1,subs:17850},
  {nivel:"I",cat:2,subs:18385.50},
  {nivel:"I",cat:3,subs:18937.07},
  {nivel:"I",cat:4,subs:19505.18},

  {nivel:"II",cat:1,subs:20090.33},
  {nivel:"II",cat:2,subs:20693.04},
  {nivel:"II",cat:3,subs:21313.83},
  {nivel:"II",cat:4,subs:21953.25},

  {nivel:"III",cat:1,subs:22611.85},
  {nivel:"III",cat:2,subs:23290.20},
  {nivel:"III",cat:3,subs:23988.91},
  {nivel:"III",cat:4,subs:24708.57},

  {nivel:"IV",cat:1,subs:25449.83},
  {nivel:"IV",cat:2,subs:26213.33},
  {nivel:"IV",cat:3,subs:26999.73},
  {nivel:"IV",cat:4,subs:27809.72},
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
  const niveis = [...new Set(tabela.map(t => t.nivel))];
  const selNivel = document.getElementById("nivel");
  const selCategoria = document.getElementById("categoria");

  niveis.forEach(n => {
    let o = document.createElement("option");
    o.value = n;
    o.text = n;
    selNivel.appendChild(o);
  });

  for (let i = 1; i <= 4; i++) {
    let o = document.createElement("option");
    o.value = i;
    o.text = i;
    selCategoria.appendChild(o);
  }
}

function alternarPrevComp() {
  const usaPrevComp = document.getElementById("usaPrevComp").value;
  const campoPrevComp = document.getElementById("prevComp");

  if (usaPrevComp === "sim") {
    campoPrevComp.value = 7.5;
  } else {
    campoPrevComp.value = 0;
  }

  calcular();
}

function calcularIR(base) {
  if (base <= 2428.80) return 0;
  if (base <= 2826.65) return base * 0.075 - 182.16;
  if (base <= 3751.05) return base * 0.15 - 394.16;
  if (base <= 4664.68) return base * 0.225 - 675.49;
  return base * 0.275 - 908.73;
}

function calcular() {
  const nivel = document.getElementById("nivel").value;
  const cat = parseInt(document.getElementById("categoria").value);
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

  const prevCompPerc = prevCompPercentual / 100;

  const dado = tabela.find(t => t.nivel === nivel && t.cat === cat);

  if (!dado) {
    document.getElementById("resultado").innerHTML = `
      <p>Não foi possível encontrar o nível e categoria selecionados.</p>
    `;
    return;
  }

  const subsidio = dado.subs;

  const iamspe = subsidio * iamspePerc;
  const pensao = subsidio * pensaoPerc;

  const basePrevComp = Math.max(0, subsidio - TETO_INSS);
  const prevComp = basePrevComp * prevCompPerc;
  const contrapartidaPatrocinador = prevComp;

  const deducaoDependentes = dependentes * DEDUCAO_DEP;

  const baseIR =
    subsidio
    - PREVIDENCIA_FIXA
    - iamspe
    - deducaoDependentes
    - pensao
    - prevComp;

  const ir = Math.max(0, calcularIR(baseIR));

  const liquido =
    subsidio
    - PREVIDENCIA_FIXA
    - iamspe
    - ir
    - pensao
    - prevComp
    - outros;

  const liquidoComAux = liquido + AUXILIO;

  document.getElementById("resultado").innerHTML = `
    <strong>Resultado da simulação</strong><br><br>

    Subsídio: ${formatarMoeda(subsidio)} <br>
    Previdência obrigatória: ${formatarMoeda(PREVIDENCIA_FIXA)} <br>
    IAMSPE: ${formatarMoeda(iamspe)} <br>
    IR: ${formatarMoeda(ir)} <br>
    Pensão: ${formatarMoeda(pensao)} <br>
    Dedução por dependentes: ${formatarMoeda(deducaoDependentes)} <br>
    Outros descontos: ${formatarMoeda(outros)} <br><br>

    <strong>Previdência complementar</strong><br>
    Teto do INSS: ${formatarMoeda(TETO_INSS)} <br>
    Base da previdência complementar: ${formatarMoeda(basePrevComp)} <br>
    Percentual escolhido: ${prevCompPercentual.toFixed(1).replace(".", ",")}% <br>
    Contribuição do servidor: ${formatarMoeda(prevComp)} <br>
    Contrapartida do patrocinador: ${formatarMoeda(contrapartidaPatrocinador)} <br><br>

    <strong>Salário líquido: ${formatarMoeda(liquido)}</strong><br>
    <strong>Salário líquido + auxílio: ${formatarMoeda(liquidoComAux)}</strong>
  `;
}

popular();
calcular();
