/*
 * checkout-links.js v1 (M3 F18 / DN18) — links de checkout por UTM, governados pelo CRM.
 *
 * USO: em páginas com botão de compra, marque os elementos e inclua o script:
 *   <a data-dq-checkout href="#">Comprar agora</a>
 *   <script src="../../assets/js/checkout-links.js" data-secao="SECAO" data-slug="PAGINA"></script>
 *
 * O script busca do CRM (endpoint público, cacheável) a config de checkout da
 * página: { default_url, rules: [{param, op, valor, url}] } — cadastrada no card
 * da página (aba Captação Externa → Links de checkout). As regras são avaliadas
 * AQUI, contra os UTMs da URL do visitante, em ordem; a primeira que casar vence.
 * Sem match (ou sem regras): default_url. Sem config nenhuma: o href original
 * do elemento fica intacto (fail-open — a página nunca quebra).
 *
 * Operador: "equals" (igual, case-insensitive) | "contains" (contém).
 * ZERO JS custom por página — toda a variação vive no cadastro do CRM.
 */
(function () {
  "use strict";

  var API_URL = "https://kqvwmmiguoqfuseabmtt.supabase.co/functions/v1/api-pagina-externa";

  var script = document.currentScript || document.querySelector('script[src*="checkout-links"]');
  if (!script) return;
  var secao = script.getAttribute("data-secao");
  var slug = script.getAttribute("data-slug");
  if (!secao || !slug) return;

  var els = document.querySelectorAll("[data-dq-checkout]");
  if (!els.length) return;

  function utmDoVisitante(param) {
    try {
      return new URLSearchParams(window.location.search).get(param) || "";
    } catch (e) {
      return "";
    }
  }

  function resolver(config) {
    var rules = (config && config.rules) || [];
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      if (!r || !r.param || !r.url) continue;
      var atual = utmDoVisitante(r.param).toLowerCase();
      var alvo = String(r.valor || "").toLowerCase();
      if (!alvo) continue;
      if (r.op === "contains" ? atual.indexOf(alvo) !== -1 : atual === alvo) {
        return r.url;
      }
    }
    return (config && config.default_url) || null;
  }

  function aplicar(url) {
    if (!url) return; // fail-open: mantém o href original do HTML
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.tagName === "A") {
        el.setAttribute("href", url);
      } else {
        // botões não-âncora: navega no clique
        (function (u) {
          el.addEventListener("click", function () { window.location.href = u; });
        })(url);
      }
    }
  }

  fetch(API_URL + "?action=checkout&secao=" + encodeURIComponent(secao) + "&slug=" + encodeURIComponent(slug))
    .then(function (res) { return res.json(); })
    .then(function (json) {
      if (json && json.success) aplicar(resolver(json));
    })
    .catch(function () { /* fail-open: href original permanece */ });
})();
