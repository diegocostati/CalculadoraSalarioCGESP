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

function popular() {
  const niveis = [...new Set(tabela.map(t=>t.nivel))];
  const selNivel = document.getElementById("nivel");
  const selCategoria = document.getElementById("categoria");

  niveis.forEach(n=>{
    let o = document.createElement("option");
    o.value = n;
    o.text = n;
    selNivel.appendChild(o);
  });

  for(let i=1;i<=4;i++){
    let o = document.createElement("option");
    o.value = i;
    o.text = i;
    selCategoria.appendChild(o);
  }
}

function calcularIR(base){
  if(base <= 2428.80) return 0;
  if(base <= 2826.65) return base*0.075 - 182.16;
  if(base <= 3751.05) return base*0.15 - 394.16;
  if(base <= 4664.68) return base*0.225 - 675.49;
  return base*0.275 - 908.73;
}

function calcular(){
  const nivel = document.getElementById("nivel").value;
  const cat = parseInt(document.getElementById("categoria").value);
  const iamspePerc = document.getElementById("iamspe").value/100;

  const dependentes = document.getElementById("dependentes").value;
  const pensaoPerc = document.getElementById("pensao").value/100;
  const prevCompPerc = document.getElementById("prevComp").value/100;
  const outros = parseFloat(document.getElementById("outros").value) || 0;

  const dado = tabela.find(t => t.nivel==nivel && t.cat==cat);

  const subsidio = dado.subs;

  const iamspe = subsidio * iamspePerc;
  const pensao = subsidio * pensaoPerc;
  const prevComp = subsidio * prevCompPerc;

  const baseIR =
    subsidio
    - PREVIDENCIA_FIXA
    - iamspe
    - (dependentes * DEDUCAO_DEP)
    - pensao
    - prevComp;

  const ir = calcularIR(baseIR);

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
  Subsídio: R$ ${subsidio.toFixed(2)} <br>
  IAMSPE: R$ ${iamspe.toFixed(2)} <br>
  IR: R$ ${ir.toFixed(2)} <br>
  Pensão: R$ ${pensao.toFixed(2)} <br>
  Previdência Complementar: R$ ${prevComp.toFixed(2)} <br>
  Outros descontos: R$ ${outros.toFixed(2)} <br>
  Líquido: R$ ${liquido.toFixed(2)} <br>
  Líquido + Aux: R$ ${liquidoComAux.toFixed(2)}
`;
}

popular();
