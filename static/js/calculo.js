let pecaCount = 0;
window._dadosMateriais = [];
window._dadosDobras = [];
window._configuracoes = {};

async function carregarMateriaisEConfigs() {
  const resMateriais = await fetch("/materiais");
  window._dadosMateriais = await resMateriais.json();

  const resDobras = await fetch("/dobras");
  window._dadosDobras = await resDobras.json();

  const resConfig = await fetch("/configuracoes");
  window._configuracoes = await resConfig.json();
}

function buscarMaterial(material, tamanho, espessura) {
  return window._dadosMateriais.find(item =>
    item.MATERIAL?.trim().toLowerCase() === material?.trim().toLowerCase() &&
    item.TAMANHO?.trim().toLowerCase() === tamanho?.trim().toLowerCase() &&
    item.ESPESSURA?.trim().toLowerCase() === espessura?.trim().toLowerCase()
  );
}

function buscarValorDobra(tamanho) {
  const item = window._dadosDobras.find(d => d.TAMANHOS?.trim() === tamanho?.trim());
  if (!item) return 0;
  return parseFloat(String(item.VALOR || "").replace("R$", "").replace(",", ".")) || 0;
}

function adicionarPeca(dados = {}) {
  pecaCount++;
  const container = document.getElementById("pecasContainer");

  const div = document.createElement("div");
  div.className = "card-peca";
  div.id = "peca_" + pecaCount;

  div.innerHTML = `
    <div class="cabecalho-card">
      <span><strong>Peça ${pecaCount}</strong>: <span id="resumo_nome_${pecaCount}">${dados.nome || 'sem nome'}</span></span>
      <div class="acoes">
        <button type="button" onclick="toggleCard(${pecaCount})"><i id="icone_toggle_${pecaCount}" class="fa fa-chevron-down"></i></button>
        <button type="button" onclick="duplicarPeca(${pecaCount})"><i class="fa fa-copy"></i></button>
        <button type="button" onclick="removerPeca(${pecaCount})"><i class="fa fa-trash"></i></button>
      </div>
    </div>
    <div class="conteudo-card aberto" id="conteudo_peca_${pecaCount}">
      <div class="linha">
        <label>Nome da Peça<br><input type="text" name="nome_peca_${pecaCount}" value="${dados.nome || ''}" oninput="document.getElementById('resumo_nome_${pecaCount}').innerText = this.value"></label>
        <label>Quantidade<br><input type="number" name="quantidade_${pecaCount}" value="${dados.quantidade || 1}"></label>
        <label class="toggle-material">
          Material do cliente?<br>
          <div class="toggle-switch">
            <input type="checkbox" name="material_cliente_${pecaCount}" id="material_cliente_${pecaCount}">
            <label for="material_cliente_${pecaCount}"></label>
          </div>
        </label>
      </div>
      <div class="linha">
        <label>Material<br><select name="material_${pecaCount}"></select></label>
        <label>Tamanho<br><select name="tamanho_${pecaCount}"></select></label>
        <label>Espessura<br><select name="espessura_${pecaCount}"></select></label>
      </div>
      <div class="linha">
        <div class="perimetro-input">
          <label>Perímetro (mm)<br>
            <input type="number" name="perimetro_${pecaCount}" value="${dados.perimetro || ''}">
          </label>
        </div>
        <div class="area-input">
          <label>Área de Corte<br>
            <input type="number" name="largura_${pecaCount}" value="${dados.largura || ''}" placeholder="Largura (mm)">
          </label>
          <label>&nbsp;<br>
            <input type="number" name="altura_${pecaCount}" value="${dados.altura || ''}" placeholder="Altura (mm)">
          </label>
        </div>
        <div class="desenho-input">
          <label>Taxa de Desenho?</label>
          <div class="radio-toggle-group">
            <input type="radio" id="desenho_sim_${pecaCount}" name="tarifa_desenho_${pecaCount}" value="Sim" checked>
            <label for="desenho_sim_${pecaCount}">Sim</label>

            <input type="radio" id="desenho_nao_${pecaCount}" name="tarifa_desenho_${pecaCount}" value="Não">
            <label for="desenho_nao_${pecaCount}">Não</label>
          </div>

        </div>
      </div>
      <div class="linha">
        
        <div id="dobras_${pecaCount}" class="dobras-tabela">
          <table>
            <tbody id="tbody_dobras_${pecaCount}">
              ${gerarHTMLDobra(pecaCount)}
            </tbody>
          </table>
        </div>
        
      </div>
      <div class="acoes-calculo" id="acoes_${pecaCount}">
        <button type="button" class="btn-recalcular" onclick="calcularValoresDaPeca(${pecaCount})">
          <i class="fa-solid fa-calculator"></i> Calcular
        </button>
      </div>
      <div class="resultado-container" id="resultado_${pecaCount}">
        <div class="tabela-resultados"></div>
        <div class="parametros-visuais"></div>
      </div>
      <div id="modal_${pecaCount}" class="modal">
        <div class="modal-content">
          <button type="button" class="modal-close" onclick="fecharModal(${pecaCount})">×</button>
          <h4>Editar Parâmetros (Peça ${pecaCount})</h4>
          <div class="modal-grid">
            <label>Valor Hora (R$)<input type="number" id="edit_hora_${pecaCount}"></label>
            <label>Fator Venda<input type="number" step="0.1" id="edit_fator_${pecaCount}"></label>
            <label>Comissão (%)<input type="number" step="0.1" id="edit_comissao_${pecaCount}"></label>
            <label>Imposto (%)<input type="number" step="0.1" id="edit_imposto_${pecaCount}"></label>
            <label>Tarifa Desenho (%)<input type="number" step="0.1" id="edit_taxa_${pecaCount}"></label>
          </div>
          <div class="modal-actions">
            <button type="button" onclick="salvarParametros(${pecaCount})">Salvar e Recalcular</button>
          </div>
        </div>
      </div>
    </div>
  `;

  container.appendChild(div);
  preencherDropdowns(pecaCount);
}

function gerarHTMLDobra(id) {
  const linhas = window._dadosDobras.map((dobra, index) => {
    const cod = dobra.CODIGO || String(index + 1).padStart(2, "0");
    const label = dobra.TAMANHOS;
    return `
      <div class="dobra-item">
        <label>${label}<br>
          <input type="number" name="dobra_${cod}_${id}" value="0" min="0" placeholder="Qtd">
        </label>
      </div>
    `;
  }).join("");

  return `
    <div class="dobras-box" id="dobras_box_${id}">
      <div class="dobras-header">
        <span>Dobras</span>
        <button type="button" class="btn-icon" onclick="mostrarDobras(${id})">
          <i class="fa fa-plus"></i>
        </button>
      </div>
      <div class="dobras-tabela-container" id="dobras_tabela_${id}">
        ${linhas}
      </div>
    </div>
  `;
}


function mostrarDobras(id) {
  const container = document.getElementById(`dobras_tabela_${id}`);
  if (container) {
    container.classList.toggle('aberto');
  }
}

function preencherDropdowns(id) {
  const materialSel = document.querySelector(`[name='material_${id}']`);
  const tamanhoSel = document.querySelector(`[name='tamanho_${id}']`);
  const espessuraSel = document.querySelector(`[name='espessura_${id}']`);

  if (!materialSel || !tamanhoSel || !espessuraSel || window._dadosMateriais.length === 0) return;

  const materiaisUnicos = [...new Set(window._dadosMateriais.map(item => item.MATERIAL?.trim()).filter(Boolean))];
  materialSel.innerHTML = '';
  tamanhoSel.innerHTML = '<option value="">Selecione</option>';
  espessuraSel.innerHTML = '<option value="">Selecione</option>';
  materialSel.appendChild(new Option("Selecione", ""));
  materiaisUnicos.forEach(material => materialSel.appendChild(new Option(material, material)));

  materialSel.addEventListener("change", () => {
    const materialSelecionado = materialSel.value;
    const tamanhosUnicos = [...new Set(window._dadosMateriais.filter(item =>
      item.MATERIAL?.trim().toLowerCase() === materialSelecionado.trim().toLowerCase()
    ).map(item => item.TAMANHO?.trim()).filter(Boolean))];
    tamanhoSel.innerHTML = '<option value="">Selecione</option>';
    espessuraSel.innerHTML = '<option value="">Selecione</option>';
    tamanhosUnicos.forEach(tamanho => tamanhoSel.appendChild(new Option(tamanho, tamanho)));
  });

  tamanhoSel.addEventListener("change", () => {
    const materialSelecionado = materialSel.value;
    const tamanhoSelecionado = tamanhoSel.value;
    const espessurasUnicas = [...new Set(window._dadosMateriais.filter(item =>
      item.MATERIAL?.trim().toLowerCase() === materialSelecionado.trim().toLowerCase() &&
      item.TAMANHO?.trim().toLowerCase() === tamanhoSelecionado.trim().toLowerCase()
    ).map(item => item.ESPESSURA?.trim()).filter(Boolean))];
    espessuraSel.innerHTML = '<option value="">Selecione</option>';
    espessurasUnicas.forEach(espessura => espessuraSel.appendChild(new Option(espessura, espessura)));
  });
}
function duplicarPeca(id) {
  const getVal = nome => document.querySelector(`[name='${nome}_${id}']`)?.value || '';

  const dados = {
    nome: getVal('nome_peca'),
    quantidade: getVal('quantidade'),
    material: getVal('material'),
    tamanho: getVal('tamanho'),
    espessura: getVal('espessura'),
    perimetro: getVal('perimetro'),
    largura: getVal('largura'),
    altura: getVal('altura'),
    tarifa: getVal('tarifa_desenho')
  };

  adicionarPeca(dados);
}

function removerPeca(id) {
  const card = document.getElementById(`peca_${id}`);
  if (card && confirm("Deseja remover esta peça?")) {
    card.remove();
    atualizarResumoTotal();
  }
}

function toggleCard(id) {
  const conteudo = document.getElementById(`conteudo_peca_${id}`);
  const icone = document.getElementById(`icone_toggle_${id}`);
  if (conteudo) {
    conteudo.classList.toggle('aberto');
    icone.classList.toggle('rotacionado');
  }
}

function abrirModal(id) {
  const modal = document.getElementById(`modal_${id}`);
  if (modal) {
    modal.style.display = 'block';
    document.getElementById(`edit_hora_${id}`).placeholder = window._configuracoes["VALOR DA HORA"];
    document.getElementById(`edit_fator_${id}`).placeholder = window._configuracoes["FATOR DE VENDA"];
    document.getElementById(`edit_comissao_${id}`).placeholder = window._configuracoes["Comissão"];
    document.getElementById(`edit_imposto_${id}`).placeholder = window._configuracoes["Imposto"];
    document.getElementById(`edit_taxa_${id}`).placeholder = window._configuracoes["Tarifa Des. Projeto"];
  }
}

function fecharModal(id) {
  const modal = document.getElementById(`modal_${id}`);
  if (modal) modal.style.display = 'none';
}

function salvarParametros(id) {
  fecharModal(id);
  calcularValoresDaPeca(id);
}

function getValorConfiguracao(campo) {
  return parseFloat((window._configuracoes[campo] || "0").replace("R$", "").replace("%", "").replace(",", ".")) || 0;
}

function getInputValor(id, fallback) {
  const el = document.getElementById(id);
  return el ? parseFloat(el.value || fallback) : fallback;
}
function calcularDobras(id) {
  let total = 0;

  window._dadosDobras.forEach((dobra, index) => {
    const cod = dobra.CODIGO || String(index + 1).padStart(2, "0");
    const campo = document.querySelector(`[name='dobra_${cod}_${id}']`);
    const qtd = parseInt(campo?.value || "0");
    const valor = buscarValorDobra(dobra.TAMANHOS);
    total += qtd * valor;
  });

  return total;
}


function calcularValoresDaPeca(id) {
  const m = document.querySelector(`[name='material_${id}']`).value;
  const t = document.querySelector(`[name='tamanho_${id}']`).value;
  const e = document.querySelector(`[name='espessura_${id}']`).value;
  const q = parseFloat(document.querySelector(`[name='quantidade_${id}']`).value || "1");
  const l = parseFloat(document.querySelector(`[name='largura_${id}']`).value || "0");
  const a = parseFloat(document.querySelector(`[name='altura_${id}']`).value || "0");
  const p = parseFloat(document.querySelector(`[name='perimetro_${id}']`).value || "0");
  const tarifa = document.querySelector(`[name='tarifa_desenho_${id}']:checked`)?.value || "Sim";

  const info = buscarMaterial(m, t, e);
  if (!info) return alert("Material não encontrado.");

  const area = (l * a) / 1_000_000;
  const perimetro = p / 1000;
  const velocidade = parseFloat(String(info["VELOCIDADE"]).replace(",", "."));
  const valor_m2 = parseFloat(String(info["R$ / m²"]).replace("R$", "").replace(",", "."));

  const vhora = getInputValor(`edit_hora_${id}`, getValorConfiguracao("VALOR DA HORA"));
  const fator = getInputValor(`edit_fator_${id}`, getValorConfiguracao("FATOR DE VENDA"));
  const comissao = getInputValor(`edit_comissao_${id}`, getValorConfiguracao("Comissão"));
  const imposto = getInputValor(`edit_imposto_${id}`, getValorConfiguracao("Imposto"));
  const taxa = getInputValor(`edit_taxa_${id}`, getValorConfiguracao("Tarifa Des. Projeto"));

  const valorMaterial = valor_m2 * area * fator;
  const materialCliente = document.querySelector(`[name='material_cliente_${id}']`)?.checked;
  const valorMaterialFinal = materialCliente ? 0 : valorMaterial;
  const tempo = perimetro / velocidade;
  const valorCorte = (tempo * vhora) / 60;
  const vdobra = calcularDobras(id) * q;
  const subtotal = valorMaterialFinal + valorCorte + vdobra;
  const vimposto = subtotal * (imposto / 100);
  const vcomissao = (subtotal + vimposto) * (comissao / 100);
  const vdesenho = tarifa === "Sim" ? subtotal * (taxa / 100) : 0;

  const totalUnit = subtotal + vcomissao + vimposto + vdesenho + vdobra;
  const total = totalUnit * q;

  const resultado = document.getElementById(`resultado_${id}`);
  resultado.classList.add('aberto');
  document.querySelector(`#resultado_${id} .tabela-resultados`).innerHTML = `
    <table>
      <thead><tr>
        <th>Material</th><th>Corte</th><th>Comissão</th><th>Imposto</th><th>Desenho</th><th>Dobras</th><th>Unitário</th><th>Total</th>
      </tr></thead>
      <tbody><tr>
        <td>R$ ${valorMaterial.toFixed(2)}</td>
        <td>R$ ${valorCorte.toFixed(2)}</td>
        <td>R$ ${vcomissao.toFixed(2)}</td>
        <td>R$ ${vimposto.toFixed(2)}</td>
        <td>R$ ${vdesenho.toFixed(2)}</td>
        <td>R$ ${vdobra.toFixed(2)}</td>
        <td><strong>R$ ${totalUnit.toFixed(2)}</strong></td>
        <td><strong>R$ ${total.toFixed(2)}</strong></td>
      </tr></tbody>
    </table>
  `;

  document.querySelector(`#resultado_${id} .parametros-visuais`).innerHTML = `
    <div class="parametros-header">
      <span>Parâmetros utilizados</span>
      <button type="button" class="editar-btn" onclick="abrirModal(${id})">
        <i class="fa-regular fa-pen-to-square"></i> Editar
      </button>
    </div>
    <div class="parametros-grid">
      <span>Hora<br><strong>R$ ${vhora}</strong></span>
      <span>Fator<br><strong>${fator}</strong></span>
      <span>Comissão<br><strong>${comissao}%</strong></span>
      <span>Imposto<br><strong>${imposto}%</strong></span>
      <span>Desenho<br><strong>${taxa}%</strong></span>
    </div>
  `;

  document.getElementById(`acoes_${id}`).innerHTML = `
    <button type="button" class="btn-recalcular" onclick="calcularValoresDaPeca(${id})">
      <i class="fa-solid fa-rotate-right"></i> Recalcular
    </button>
    <button type="button" class="btn-toggle-resultado" onclick="toggleResultado(${id})">
      <i class="fa-solid fa-eye-slash"></i> Ocultar Resultado
    </button>
  `;

  atualizarResumoTotal();
}

function toggleResultado(id) {
  const resultado = document.getElementById(`resultado_${id}`);
  const botao = document.querySelector(`#acoes_${id} .btn-toggle-resultado`);
  if (!resultado || !botao) return;

  const visivel = resultado.classList.toggle('aberto');
  botao.innerHTML = visivel
    ? '<i class="fa-solid fa-eye-slash"></i> Ocultar Resultado'
    : '<i class="fa-solid fa-eye"></i> Mostrar Resultado';
}

function atualizarResumoTotal() {
  let total = 0;
  document.querySelectorAll(".tabela-resultados tbody tr td:last-child strong").forEach(el => {
    const valor = parseFloat(el.textContent.replace("R$", "").replace(",", "."));
    if (!isNaN(valor)) total += valor;
  });
  document.getElementById("resumoTotal").textContent = `R$ ${total.toFixed(2)}`;
}
// ─────────────────────────────────────────────────────────────────────────────
// 1. (Opcional) Função auxiliar para formatar valores em “R$ XX,XX”
// ─────────────────────────────────────────────────────────────────────────────
function formatarBRL(valor) {
  return "R$ " + Number(valor).toFixed(2).replace(".", ",");
}


// ─────────────────────────────────────────────────────────────────────────────
// 2. Gera as linhas <tr> da tabela de peças, lendo cada .card-peca do DOM
// ─────────────────────────────────────────────────────────────────────────────
function montarLinhasTabelaPecas() {
  const cards = document.querySelectorAll(".card-peca");
  let linhasHTML = "";

  cards.forEach(card => {
    const id = card.id.split("_")[1];

    // Se existir um input “codigo_<id>” no seu formulário, use-o aqui; 
    // caso contrário, deixe string vazia:
    const codigo = document.querySelector(`[name="codigo_${id}"]`)?.value || "";

    const nome     = document.querySelector(`[name="nome_peca_${id}"]`).value;
    const material = document.querySelector(`[name="material_${id}"]`).value;
    const qtde     = parseInt(document.querySelector(`[name="quantidade_${id}"]`).value || "0", 10);

    // Na tabela gerada por calcularValoresDaPeca(id), 
    // a 7ª coluna (índice 6) é “Unitário” e a 8ª (índice 7) é “Total”
    const tabelaResultados = document.querySelector(`#resultado_${id} .tabela-resultados table`);
    let unitario = "";
    let total    = "";

    if (tabelaResultados) {
      const celulas = tabelaResultados.querySelectorAll("tbody tr td");
      unitario = celulas[6]?.innerText || "";
      total    = celulas[7]?.innerText || "";
    }

    linhasHTML += `
      <tr>
        <td>${nome}</td>
        <td>${material}</td>
        <td>${qtde}</td>
        <td>${unitario}</td>
        <td>${total}</td>
      </tr>
    `;
  });

  return linhasHTML;
}


// ─────────────────────────────────────────────────────────────────────────────
// 3. Monta o HTML COMPLETO do orçamento, com TODO o CSS inline ajustado:
//    – zera margin/padding de html e body
//    – posiciona .pagina-a4 no topo, com dimensões fixas (794×1123 px)
// ─────────────────────────────────────────────────────────────────────────────
function montarHTMLOrcamento() {
  // === 1) Dados do cliente vindos do form ===
  const empresa     = document.querySelector('[name="empresa"]').value;
  const cnpj        = document.querySelector('[name="cnpj"]').value;
  const responsavel = document.querySelector('[name="responsavel"]').value;
  const telefone    = document.querySelector('[name="telefone"]').value;
  const solicitante = document.querySelector('[name="solicitante"]').value;

  // === 2) Data atual (DD/MM/AAAA) ===
  const hoje = new Date();
  const dia  = String(hoje.getDate()).padStart(2, "0");
  const mes  = String(hoje.getMonth() + 1).padStart(2, "0");
  const ano  = hoje.getFullYear();
  const dataFormatada = `${dia}/${mes}/${ano}`;

  // Se tiver campo “cidade” no seu form, adapte aqui; caso não, deixe hífen:
  const cidade = "Rio Negrinho-SC";

  // === 3) Monta as linhas da tabela de peças ===
  const linhasDePecas = montarLinhasTabelaPecas();

  // === 4) Puxa o “Total Estimado” (texto “R$ XX,XX”) de <p id="resumoTotal"> ===
  const totalGeral = document.getElementById("resumoTotal").innerText;

  // === 5) Bloco fixo de informações (Itens inclusos, não inclusos, formas de pagamento e frete) ===
  const blocoInfo = `
    <div class="bloco-informacoes">
      <div class="coluna">
        <p>
          <strong class="titulo-info">Itens inclusos:</strong><br>
          Matéria-prima e serviço de corte a laser e dobra
        </p>
        <p>
          <strong class="titulo-info">Itens não inclusos:</strong><br>
          Serviço de solda
        </p>
        <p>
          <strong class="titulo-info">Prazo de entrega:</strong><br>
          Agendado entre as partes
        </p>
        <p>
          <strong class="titulo-info">Validade da proposta:</strong><br>
          5 dias
        </p>
      </div>
      <div class="coluna">
        <p>
          <strong class="titulo-info">Formas de pagamento:</strong>
        </p>
        <ul>
          <li>À vista</li>
          <li>Faturamento mínimo: R$ 200,00</li>
          <li>21 dias para pedidos até R$ 1.000,00</li>
          <li>28 / 56 dias para pedidos acima de R$ 1.000,00</li>
          <li>Mediante análise cadastral</li>
        </ul>
        <p>
          <strong class="titulo-info">Frete:</strong><br>
          FOB
        </p>
      </div>
    </div>
  `;

  // === 6) Rodapé institucional (mesmo do seu template estático) ===
  const rodape = `
    <footer class="rodape-tm">
      <div class="rodape-container">
        <div class="rodape-logo">
          <img src="https://tmmaquinas.com.br/wp-content/uploads/2024/10/logo-tm-branco.png" alt="Logo TM" />
        </div>
        <div class="rodape-separador"></div>
        <div class="rodape-info">
          <div class="linha-superior">
            <span><strong>CNPJ:</strong> 10.394.100/0001-01</span>
            <span><strong>Insc. Estadual:</strong> 255757310</span>
          </div>
          <div class="linha-inferior">
            <div class="info-item">
              <img src="https://tmmaquinas.com.br/wp-content/uploads/2025/04/icone-phone.png" alt="Telefone" />
              <span>
                <small>47</small> <strong class="fone-destaque">3644-9395</strong>
              </span>
            </div>
            <div class="info-item">
              <img src="https://tmmaquinas.com.br/wp-content/uploads/2025/04/icone-address.png" alt="Endereço" />
              <span>
                Avenida Klaus Schumacher, 492, Galpão 01,<br>
                Industrial Sul, Cep 89.295-752, Rio Negrinho-SC
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `;

  // === 7) TODO O CSS do seu orcamento.html original, mas 
  //      removendo @page e usando largura/altura fixas A4 em px ===
  const cssOrcamento = `
    /* ====================================================
       CSS ÍNTEGRO DO ORÇAMENTO (layout A4, sem margens)
       ==================================================== */
    html, body {
      margin: 0;
      padding: 0;
    }
    * {
      box-sizing: border-box;
    }
    /* .pagina-a4: dimensões fixas (794px × 1123px == 210×297 mm @ 96dpi) */
    .pagina-a4 {
      height: 100%;    /* ~297 mm */
      background: white;
      margin: 0 auto;    /* centraliza horizontalmente */
      display: flex;
      flex-direction: column;
      justify-content: flex-start; /* cabeçalho colado no topo */
      position: relative;
      overflow: hidden;
      font-family: Arial, sans-serif;
    }

    /* Cabeçalho */
    .header {
      display: flex;
      justify-content: space-between;
      background: linear-gradient(to right, #033C8B, #0E62C3);
      color: white;
      padding: 40px;
      margin: 0; /* sem margem extra */;
      align-items: center;
    }
    .logo img {
      width: 100px;
      height: auto;
    }
    .orcamento-box {
      background-color: #FFCB05;
      color: #033C8B;
      font-size: 20px;
      font-weight: bold;
      display: inline-block;
      padding: 10px 25px;
      width: fit-content;
      margin-top: 15px;
      clip-path: polygon(0 0, 100% 0, 95% 100%, 0% 100%);
    }
    .orcamento-box span {
      display: inline-block;
    }
    .local-data {
      font-size: 14px;
      margin-top: 10px;
      color: white;
    }
    .info-cliente {
      text-align: left;
      font-size: 14px;
    }
    .info-cliente h3 {
      color: #ffffff;
      font-size: 20px;
      margin-bottom: 5px;
      border-left: 5px solid #ffcb05;
      padding-left: 5px;
      margin: 0; /* sem margem extra */
    }
    .info-cliente p {
      margin: 4px 0;
    }
    .campo {
      font-weight: bold;
      color: #fff;
    }

    /* Conteúdo (tabela e informações) */
    .conteudo {
      padding: 50px;
      flex-grow: 1;
      overflow: hidden;
    }
    .titulo-tabela {
      font-size: 16px;
      text-align: left;
      margin-bottom: 10px;
      border-left: 5px solid #ffcb05;
      padding-left: 5px;
      text-transform: uppercase;
      color: #033d8d;
      margin: 0; /* sem margem extra */
    }
    .tabela-itens {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
      margin-bottom: 10px;
    }
    .tabela-itens thead tr {
      background-color: #0c5ab7;
      color: white;
    }
    .tabela-itens th,
    .tabela-itens td {
      padding: 8px 10px;
      text-align: left;
      border: 1px solid #ccc;
    }
    .tabela-itens tbody tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .linha-total {
      background-color: #ddd;
      font-weight: bold;
    }
    .linha-total td {
      text-align: right;
    }
    .linha-total td:first-child {
      text-align: left;
    }
    .observacao {
      font-size: 13px;
      margin: 0; /* sem margem extra */
      color: #333;
      margin-top: 5px;
    }
    .bloco-informacoes {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px 40px;
      font-size: 14px;
      color: #333;
      margin-top: 30px;
      justify-items: start;
      line-height: 1.5;
    }
    .bloco-informacoes p {
      margin: 8px 0;
    }
    .bloco-informacoes ul {
      padding-left: 20px;
      margin-top: 5px;
      margin-bottom: 10px;
    }
    .bloco-informacoes li {
      margin-bottom: 4px;
    }
    .titulo-info {
      color: #033d8d;
      font-weight: 600;
      display: inline-block;
      margin-bottom: 2px;
    }

    /* Rodapé institucional */
    .rodape-tm {
      background-color: #223b7a;
      color: white;
      padding: 20px 40px;
      font-size: 13px;
      height: 130px;
      box-sizing: border-box;
      margin: 0; /* sem margem extra */
    }
    .rodape-container {
      display: flex;
      align-items: center;
      gap: 30px;
      justify-content: flex-start;
      flex-wrap: wrap;
      position: relative;
    }
    .rodape-logo img {
      width: 100px;
      height: auto;
      margin-top: 5px;
    }
    .rodape-separador {
      width: 1px;
      background-color: #ffffff33;
      height: 100%;
      margin: 0 20px;
    }
    .rodape-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .linha-superior {
      display: flex;
      gap: 40px;
      font-size: 13px;
      flex-wrap: wrap;
    }
    .linha-superior strong {
      font-weight: bold;
      margin-right: 4px;
    }
    .linha-inferior {
      display: flex;
      flex-wrap: wrap;
      gap: 40px;
    }
    .info-item {
      display: flex;
      align-items: center;
      gap: 10px;
      line-height: 1.2;
    }
    .info-item img {
      width: 30px;
      height: 30px;
      object-fit: contain;
      flex-shrink: 0;
      vertical-align: middle;
    }
    .fone-destaque {
      font-size: 16px;
      font-weight: bold;
      line-height: 1;
    }
    .info-item small {
      font-size: 12px;
      opacity: 0.8;
      vertical-align: middle;
      margin-right: 2px;
    }

    /* -------------------------------------------------------------
       Botões de controle (fora da área .pagina-a4, apenas layout)
       ------------------------------------------------------------- */
    #botoes {
      text-align: center;
      margin: 20px 0;
    }
    #botoes button {
      padding: 10px 20px;
      font-size: 14px;
      margin: 0 10px;
      cursor: pointer;
      border: none;
      background-color: #0c5ab7;
      color: white;
      border-radius: 4px;
    }
    #botoes button:hover {
      background-color: #033c8b;
    }
  `;

  // === 8) Monta o HTML final, incluindo o CSS inline acima ===
  const htmlOrcamentoCompleto = `
    <title>Orçamento Corte a Laser</title>
    <div class="pagina-a4" id="conteudo-orcamento-pdf">
      <style>${cssOrcamento}</style>

      <div class="header">
        <div>
          <div class="logo">
            <img src="https://tmmaquinas.com.br/wp-content/uploads/2024/10/logo-tm-branco.png" style="width: 100px; height: auto;">
          </div>
          <div class="orcamento-box">
            <span>ORÇAMENTO 1.0</span>
          </div>
          <div class="local-data">
            <span class="campo">${cidade}</span>, <span class="campo">${dataFormatada}</span>
          </div>
        </div>

        <div class="info-cliente">
          <h3>CLIENTE</h3>
          <p><strong>Empresa:</strong> <span class="campo">${empresa}</span></p>
          <p><strong>CNPJ:</strong> <span class="campo">${cnpj}</span></p>
          <p><strong>Responsável:</strong> <span class="campo">${responsavel}</span></p>
          <p><strong>Telefone:</strong> <span class="campo">${telefone}</span></p>
          <p><strong>Solicitante:</strong> <span class="campo">${solicitante}</span></p>
        </div>
      </div>

      <div class="conteudo">
        <h2 class="titulo-tabela">Material e Serviço de Corte a Laser</h2>
        <table class="tabela-itens">
          <thead>
            <tr>
              <th>DESCRIÇÃO DO ITEM</th>
              <th>MATERIAL</th>
              <th>Qtde.</th>
              <th>Unitário</th>
              <th>PREÇO TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${linhasDePecas}
          </tbody>
          <tfoot>
            <tr class="linha-total">
              <td colspan="4">TOTAL</td>
              <td><strong>${totalGeral}</strong></td>
            </tr>
          </tfoot>
        </table>
        <p class="observacao"><em>Não incluso 6,5% de IPI</em></p>

        ${blocoInfo}

      </div>
      
      ${rodape}
    </div>
  `;

  return htmlOrcamentoCompleto;
}

function enviarPDFWebhook() {
  // 1) Recalcula tudo como antes
  document.querySelectorAll(".card-peca").forEach(card => {
    const id = card.id.split("_")[1];
    calcularValoresDaPeca(id);
  });
  atualizarResumoTotal();

  // 2) Monta o HTML completo
  const htmlDoOrcamento = montarHTMLOrcamento();

  // 3) Injeta esse HTML no campo hidden do form
  const input = document.getElementById("webhookHtml");
  input.value = htmlDoOrcamento;

  // 4) Submete o form para o webhook (sem CORS)
  document.getElementById("webhookForm").submit();

  // 5) Feedback pro usuário
  alert("Orçamento enviado ao webhook!");
}
/**
 * Envia o HTML do orçamento ao seu webhook n8n/Gotenberg
 * e abre o PDF resultante em uma nova aba para download.
 */
function baixarPdfViaWebhookForm() {
  // ✅ Passo 0: Validar o preenchimento do formulário
  if (!validarFormularioAntesDeEnviar()) {
    return; // Se a validação falhar, cancela o envio
  }

  // 1) Recalcula tudo
  document.querySelectorAll(".card-peca").forEach(card => {
    const id = card.id.split("_")[1];
    calcularValoresDaPeca(id);
  });
  atualizarResumoTotal();

  // 2) Monta o HTML do orçamento
  const htmlDoOrcamento = montarHTMLOrcamento();

  // 3) Cria um form temporário
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://automacao-n8n.llvxyq.easypanel.host/webhook/enviar-pdf';
  form.target = '_blank';           // abre resultado em nova aba
  form.style.display = 'none';

  // 4) Campo hidden para o HTML
  const input = document.createElement('input');
  input.type  = 'hidden';
  input.name  = 'html';
  input.value = htmlDoOrcamento;
  form.appendChild(input);

  // 5) Injeta e submete
  document.body.appendChild(form);
  form.submit();

  // 6) Remove o form do DOM
  document.body.removeChild(form);
}

/**
 * Converte "R$ 1.234,56" → 1234.56
 */
function parseCurrency(str) {
  if (typeof str !== "string") return 0;
  return parseFloat(
    str.replace(/\s/g, "")
       .replace("R$", "")
       .replace(/\./g, "")
       .replace(",", ".")
       .trim()
  ) || 0;
}
function parseCurrency2(str) {
  if (typeof str !== "string") return 0;
  const limpo = str
    .replace(/\s/g, "")
    .replace("R$", "")
    .replace(",", ".")
    .trim();

  return parseFloat(limpo) || 0;
}

/**
 * Converte "15%" ou "1,4" → número
 */
function parseNumber(str) {
  if (typeof str !== "string") return 0;
  return parseFloat(
    str.replace("%", "")
       .replace(",", ".")
       .trim()
  ) || 0;
}

/**
 * Lê um parâmetro de input `#edit_{campo}_{id}` ou cai num padrão global.
 */
function readParam(id, campo, configKeys) {
  const inp = document.getElementById(`edit_${campo}_${id}`);
  if (inp && inp.value.trim() !== "") {
    return campo === "hora"
      ? parseCurrency(inp.value)
      : parseNumber(inp.value);
  }
  const cfg = window._configuracoes || {};
  for (const key of configKeys) {
    if (cfg[key] != null) {
      return campo === "hora"
        ? parseCurrency(cfg[key])
        : parseNumber(cfg[key]);
    }
  }
  return 0;
}

function enviarDadosParaPlanilhaComoFormData() {
  // Garante que os cálculos estejam atualizados
  document.querySelectorAll(".card-peca").forEach(card => {
    const id = card.id.replace('peca_', '');
    calcularValoresDaPeca(id);
  });

  const dados = montarJSONParaPlanilha();
  const jsonString = JSON.stringify(dados);

  document.getElementById('loadingOverlay').style.display = 'flex';

  const formData = new FormData();
  formData.append('payload', jsonString);

  fetch('https://automacao-n8n.llvxyq.easypanel.host/webhook-test/dados-planilha2', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Falha ao baixar a planilha');
    }
    return response.blob();
  })
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orcamento.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  })
  .catch(error => {
    console.error('Erro ao baixar planilha:', error);
    alert('Erro ao baixar a planilha.');
  })
  .finally(() => {
    // Esconde a mensagem de loading, mesmo que dê erro
    document.getElementById('loadingOverlay').style.display = 'none';
  });
}

function montarJSONParaPlanilha() {
  const cliente = {
    empresa: document.querySelector('[name="empresa"]').value,
    cnpj: document.querySelector('[name="cnpj"]').value,
    responsavel: document.querySelector('[name="responsavel"]').value,
    telefone: document.querySelector('[name="telefone"]').value,
    solicitante: document.querySelector('[name="solicitante"]').value,
    data: new Date().toLocaleDateString('pt-BR')
  };

  const pecas = [];
  document.querySelectorAll('.card-peca').forEach(card => {
    const id = card.id.replace('peca_', '');

    const nome = card.querySelector(`[name="nome_peca_${id}"]`).value;
    const quantidade = parseFloat(card.querySelector(`[name="quantidade_${id}"]`)?.value || "0");
    const material = card.querySelector(`[name="material_${id}"]`).value;

    const valorHora = readParam(id, "hora", ["VALOR DA HORA", "Hora"]);
    const fator = readParam(id, "fator", ["FATOR DE VENDA", "Fator"]);
    const comissao = readParam(id, "comissao", ["Comissão"]);
    const imposto = readParam(id, "imposto", ["Imposto", "Imposto %"]);
    const tarifa = readParam(id, "taxa", ["Tarifa Des. Projeto", "Desenho"]);

    const cells = card.querySelectorAll(`#resultado_${id} .tabela-resultados table tbody tr td`);
    if (cells.length < 8) return;  // Só pega peças já calculadas

    const custoMaterial = parseCurrency2(cells[0].innerText);
    const custoCorte = parseCurrency2(cells[1].innerText);
    const custoComissao = parseCurrency2(cells[2].innerText);
    const custoImposto = parseCurrency2(cells[3].innerText);
    const custoDesenho = parseCurrency2(cells[4].innerText);
    const custoDobras = parseCurrency2(cells[5].innerText);
    const unitario = parseCurrency2(cells[6].innerText);
    const total = parseCurrency2(cells[7].innerText);

    const dobras = {};
    (window._dadosDobras || []).forEach((dobra, index) => {
      const cod = dobra.CODIGO;
      const input = card.querySelector(`input[name='dobra_${cod}_${id}']`);
      dobras[cod] = input ? parseFloat(input.value) || 0 : 0;
    });

    pecas.push({
      nome,
      quantidade,
      material,
      valor_hora: valorHora,
      fator_venda: fator,
      comissao,
      imposto,
      tarifa_desenho: tarifa,
      custo_material: custoMaterial,
      custo_corte: custoCorte,
      custo_comissao: custoComissao,
      custo_imposto: custoImposto,
      custo_desenho: custoDesenho,
      custo_dobras: custoDobras,
      unitario,
      total,
      dobras
    });
  });

  return { cliente, pecas };
}

function calcularTotalEstimado() {
  let totalGeral = 0;

  document.querySelectorAll('.card-peca').forEach(card => {
    const id = card.id.replace('peca_', '');

    const material = document.querySelector(`[name='material_${id}']`)?.value;
    const tamanho = document.querySelector(`[name='tamanho_${id}']`)?.value;
    const espessura = document.querySelector(`[name='espessura_${id}']`)?.value;
    const quantidade = parseFloat(document.querySelector(`[name='quantidade_${id}']`)?.value || "0");
    const largura = parseFloat(document.querySelector(`[name='largura_${id}']`)?.value || "0");
    const altura = parseFloat(document.querySelector(`[name='altura_${id}']`)?.value || "0");
    const perimetro = parseFloat(document.querySelector(`[name='perimetro_${id}']`)?.value || "0");
    const tarifa = document.querySelector(`[name='tarifa_desenho_${id}']:checked`)?.value || "Sim";
    const materialCliente = document.querySelector(`[name='material_cliente_${id}']`)?.checked;

    if (!material || !tamanho || !espessura || quantidade <= 0) return;

    const info = buscarMaterial(material, tamanho, espessura);
    if (!info) return;

    const area = (largura * altura) / 1_000_000;
    const perimetroKm = perimetro / 1000;
    const velocidade = parseFloat(String(info["VELOCIDADE"]).replace(",", "."));
    const valor_m2 = parseFloat(String(info["R$ / m²"]).replace("R$", "").replace(",", "."));

    const vhora = getValorConfiguracao("VALOR DA HORA");
    const fator = getValorConfiguracao("FATOR DE VENDA");
    const comissao = getValorConfiguracao("Comissão");
    const imposto = getValorConfiguracao("Imposto");
    const taxa = getValorConfiguracao("Tarifa Des. Projeto");

    const valorMaterial = valor_m2 * area * fator;
    const valorMaterialFinal = materialCliente ? 0 : valorMaterial;

    const tempo = perimetroKm / velocidade;
    const valorCorte = (tempo * vhora) / 60;

    const subtotal = valorMaterialFinal + valorCorte;

    const valorImposto = subtotal * (imposto / 100);
    const valorComissao = (subtotal + valorImposto) * (comissao / 100);
    const valorDesenho = tarifa === "Sim" ? subtotal * (taxa / 100) : 0;

    // Calcular o valor das dobras
    let valorDobras = 0;
    window._dadosDobras.forEach((dobra, index) => {
      const cod = dobra.CODIGO || String(index + 1).padStart(2, "0");
      const campo = document.querySelector(`[name='dobra_${cod}_${id}']`);
      const qtd = parseInt(campo?.value || "0");
      const valorUnit = buscarValorDobra(dobra.TAMANHOS);
      valorDobras += qtd * valorUnit;
    });

    const totalUnit = subtotal + valorComissao + valorImposto + valorDesenho + valorDobras;
    totalGeral += totalUnit * quantidade;
  });

  document.getElementById("resumoTotal").textContent = `R$ ${totalGeral.toFixed(2)}`;
}
function ativarTotalEstimadoAutomatico() {
  const form = document.getElementById('orcamentoForm');
  if (!form) return;

  form.addEventListener('input', () => {
    calcularTotalEstimado();
  });
}

ativarTotalEstimadoAutomatico();

function validarFormularioAntesDeEnviar() {
  // Validar campos do cliente
  const camposCliente = ['empresa', 'cnpj', 'responsavel', 'telefone', 'solicitante'];
  for (let campo of camposCliente) {
    const el = document.querySelector(`[name='${campo}']`);
    if (!el || !el.value.trim()) {
      alert(`Por favor, preencha o campo: ${campo}`);
      return false;
    }
  }

  // Validar cada peça
  let todasPecasOk = true;
  document.querySelectorAll('.card-peca').forEach(card => {
    const id = card.id.replace('peca_', '');

    const camposPeca = [
      { nome: 'nome_peca', label: 'Nome da Peça' },
      { nome: 'quantidade', label: 'Quantidade' },
      { nome: 'material', label: 'Material' },
      { nome: 'tamanho', label: 'Tamanho' },
      { nome: 'espessura', label: 'Espessura' },
      { nome: 'perimetro', label: 'Perímetro' },
      { nome: 'largura', label: 'Largura' },
      { nome: 'altura', label: 'Altura' }
    ];

    for (let campo of camposPeca) {
      const el = document.querySelector(`[name='${campo.nome}_${id}']`);
      if (!el || el.value.trim() === '' || el.value === '0') {
        alert(`Por favor, preencha o campo "${campo.label}" da Peça ${id}`);
        todasPecasOk = false;
        return false;
      }
    }
  });

  return todasPecasOk;
}
