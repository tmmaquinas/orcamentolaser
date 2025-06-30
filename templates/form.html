<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Orçamento Corte a Laser</title>
  <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
  <link rel="icon" type="image/png" sizes="16x16"  href="https://tmmaquinas.com.br/wp-content/uploads/2025/06/favicon2.png">
  <meta name="msapplication-TileColor" content="#ffffff">
  <meta name="theme-color" content="#ffffff">
</head>
<body>

  <img class="logo-inner" src="https://tmmaquinas.com.br/wp-content/uploads/2024/06/LOGO.png">

  <form id="orcamentoForm">
    <div class="secao">
      <div class="linha">
        <label>Nome da Empresa<br>
          <input type="text" name="empresa" required placeholder="Ex: TM Máquinas">
        </label>
        <label>CNPJ<br>
          <input type="text" name="cnpj" required placeholder="00.000.000/0000-00">
        </label>
      </div>
      <div class="linha">
        <label>Responsável<br>
          <input type="text" name="responsavel" required>
        </label>
        <label>Telefone<br>
          <input type="text" name="telefone" required placeholder="(11) 99999-9999">
        </label>
      </div>
      <div class="linha">
        <label>Solicitante<br>
          <input type="text" name="solicitante" required>
        </label>
      </div>
    </div>
    <div id="pecasContainer"></div>
    <div class="secao">
      <button type="button" onclick="adicionarPeca()">
        <i class="fa fa-plus"></i> Adicionar Peça
      </button>
    </div>
    <div class="secao resumo-geral">
      <h3>Total Estimado</h3>
      <p id="resumoTotal">R$ 0,00</p>
    </div>
    <!-- Botões de ação -->
    <div class="acoes-form">
      <button type="button" onclick="baixarPdfViaWebhookForm()"><img style="width: 20px; height: 20px;" src="https://tmmaquinas.com.br/wp-content/uploads/2025/06/pdf.png"/> BAIXAR PDF</button>
      <button type="button" onclick="enviarDadosParaPlanilhaComoFormData()"><img style="width: 20px; height: 20px;" src="https://tmmaquinas.com.br/wp-content/uploads/2025/06/excel.png"/>EXPORTAR XLSX</button>
    </div>
    <div id="loadingOverlay" style="display: none;">
      <div class="spinner"></div>
      <div>Gerando sua planilha... Por favor, aguarde.</div>
    </div>

  </form>
<script>
  const cnpjInput = document.querySelector('[name="cnpj"]');
  const telefoneInput = document.querySelector('[name="telefone"]');

  cnpjInput?.addEventListener('input', () => {
    let cnpj = cnpjInput.value.replace(/\D/g, '').slice(0, 14);
    cnpj = cnpj.replace(/^(\d{2})(\d)/, '$1.$2')
               .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
               .replace(/\.(\d{3})(\d)/, '.$1/$2')
               .replace(/(\d{4})(\d)/, '$1-$2');
    cnpjInput.value = cnpj;
  });

  telefoneInput?.addEventListener('input', () => {
    let tel = telefoneInput.value.replace(/\D/g, '').slice(0, 11);
    if (tel.length <= 10) {
      tel = tel.replace(/^(\d{2})(\d{4})(\d)/, '($1) $2-$3');
    } else {
      tel = tel.replace(/^(\d{2})(\d{5})(\d)/, '($1) $2-$3');
    }
    telefoneInput.value = tel;
  });
</script>

  <!-- Seu script de cálculo (adicionarPeca, calcularValoresDaPeca, etc.) -->
  <script src="{{ url_for('static', filename='js/calculo.js') }}"></script>
  <!-- html2pdf.js (deve vir depois do calculo.js) -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>

  <script>
    document.addEventListener("DOMContentLoaded", async () => {
      await carregarMateriaisEConfigs();
      adicionarPeca();
    });
  </script>
  <!-- form escondido para enviar ao webhook sem CORS -->
<form id="webhookForm" method="POST"
      action="https://automacao-n8n.llvxyq.easypanel.host/webhook/dados-planilha2"
      target="hidden_iframe" style="display:none">
  <input type="hidden" name="html" id="webhookHtml">
</form>
<iframe name="hidden_iframe" style="display:none;"></iframe>

</body>
</html>
