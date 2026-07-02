/*
 * lead-capture.js v2 — captura de leads das páginas externas (dq-paginas → CRM DQ).
 *
 * USO (snippet canônico em /templates/formulario.html):
 *   <form class="dq-lead-form" data-secao="SECAO" data-slug="PAGINA">
 *     <input name="nome" required> <input name="whatsapp" required> <input name="email">
 *     ... campos extras: qualquer input/select/textarea com name (ex: name="instituto"),
 *         desde que o campo esteja cadastrado na página no CRM (aba Captação Externa) ...
 *     <button type="submit">...</button>
 *   </form>
 *   <script src="../../assets/js/lead-capture.js"></script>
 *
 * data-secao + data-slug = seção e página cadastradas no CRM (viram as pastas
 * /{secao}/{slug}/ deste repo). UTMs da URL são repassados automaticamente.
 *
 * FINAL PÓS-CADASTRO (configurado no CRM, nunca aqui):
 *   - conteudo:     o CRM responde { unlock: true } → este script dispara o evento
 *                   "dq:unlock" no document (a página escuta e revela o conteúdo)
 *                   e revela elementos [data-dq-gate] (fallback genérico).
 *   - link_externo / obrigado / brinde: o CRM responde { redirect } → navegamos.
 *
 * Erros aparecem no elemento [data-dq-error] do form (criado se não existir;
 * ganha a classe "dq-visible" — estilize .dq-visible no CSS da página se quiser).
 *
 * TODA a apresentação (títulos, copy, botão, obrigado) é ESTÁTICA no HTML — fonte
 * única. Endpoint público (sem secret). A tag UnniChat NUNCA passa por aqui: é
 * aplicada dentro da automação UnniChat, acionada pelo servidor do CRM.
 */
(function () {
  "use strict";

  var API_URL = "https://kqvwmmiguoqfuseabmtt.supabase.co/functions/v1/api-pagina-externa";
  var RESERVED = { nome: 1, whatsapp: 1, email: 1 };

  // Base do site derivada da localização deste script — funciona tanto em
  // site.dissecandoquestoes.com quanto em profmmdq.github.io/dq-paginas/
  var script = document.currentScript || document.querySelector('script[src*="lead-capture"]');
  var SITE_BASE = script && script.src ? script.src.replace(/\/assets\/js\/[^/]*$/, "") : "";

  function resolveRedirect(redirect) {
    if (!redirect) return SITE_BASE + "/";
    if (redirect.charAt(0) === "/") return SITE_BASE + redirect;
    return redirect;
  }

  function getUtms() {
    var keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
    var params = new URLSearchParams(window.location.search);
    var utms = {};
    for (var i = 0; i < keys.length; i++) {
      var v = params.get(keys[i]);
      if (v) utms[keys[i]] = v;
    }
    return utms;
  }

  function errorEl(form) {
    var el = form.querySelector("[data-dq-error]");
    if (!el) {
      el = document.createElement("div");
      el.setAttribute("data-dq-error", "");
      el.setAttribute("data-dq-created", "");
      el.style.cssText =
        "display:none;color:#b3450a;background:#fde6da;border-radius:10px;padding:12px;font-size:14px;font-weight:600;margin-top:12px;";
      form.appendChild(el);
    }
    return el;
  }

  function showError(form, message) {
    var el = errorEl(form);
    el.textContent = message;
    el.classList.add("dq-visible");
    if (el.hasAttribute("data-dq-created")) el.style.display = "block";
  }

  function clearError(form) {
    var el = errorEl(form);
    el.textContent = "";
    el.classList.remove("dq-visible");
    if (el.hasAttribute("data-dq-created")) el.style.display = "none";
  }

  function setLoading(form, loading) {
    var btn = form.querySelector("[data-dq-submit]") || form.querySelector("button[type=submit]");
    if (!btn) return;
    if (loading) {
      if (!btn.getAttribute("data-dq-label")) btn.setAttribute("data-dq-label", btn.textContent);
      btn.disabled = true;
      btn.textContent = "Enviando...";
    } else {
      btn.disabled = false;
      var label = btn.getAttribute("data-dq-label");
      if (label) btn.textContent = label;
    }
  }

  // Campos extras = qualquer campo nomeado além de nome/whatsapp/email.
  // Precisam estar cadastrados na página no CRM (senão o servidor rejeita o envio).
  function coletarExtras(form) {
    var extras = {};
    var tem = false;
    for (var i = 0; i < form.elements.length; i++) {
      var el = form.elements[i];
      var name = el.name;
      if (!name || RESERVED[name]) continue;
      if (el.tagName === "BUTTON" || el.type === "submit" || el.type === "button") continue;
      if ((el.type === "checkbox" || el.type === "radio") && !el.checked) continue;
      var v = (el.value || "").trim();
      if (v) { extras[name] = v; tem = true; }
    }
    return tem ? extras : null;
  }

  function unlock(json) {
    // 1. Evento para a página reagir (gate custom — ex: /captacao/radar/)
    try {
      document.dispatchEvent(new CustomEvent("dq:unlock", { detail: json || {} }));
    } catch (e) { /* no-op */ }
    // 2. Fallback genérico: revela elementos marcados com data-dq-gate
    var gated = document.querySelectorAll("[data-dq-gate]");
    for (var i = 0; i < gated.length; i++) {
      gated[i].classList.add("dq-unlocked");
      gated[i].style.display = "";
    }
    document.documentElement.classList.add("dq-unlocked");
  }

  document.addEventListener("submit", function (ev) {
    var form = ev.target;
    if (!form || !form.classList || !form.classList.contains("dq-lead-form")) return;
    var secao = form.getAttribute("data-secao");
    var slug = form.getAttribute("data-slug");
    if (!secao || !slug) return; // form sem identificação completa é ignorado
    ev.preventDefault();

    clearError(form);

    var nome = ((form.elements.nome && form.elements.nome.value) || "").trim();
    var whatsapp = ((form.elements.whatsapp && form.elements.whatsapp.value) || "").trim();
    var email = ((form.elements.email && form.elements.email.value) || "").trim();
    if (!nome || !whatsapp) {
      showError(form, "Preencha nome e WhatsApp.");
      return;
    }

    var payload = { action: "submit", secao: secao, slug: slug, nome: nome, whatsapp: whatsapp };
    if (email) payload.email = email;
    var extras = coletarExtras(form);
    if (extras) payload.extras = extras;
    var utms = getUtms();
    for (var k in utms) payload[k] = utms[k];

    setLoading(form, true);
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (json) {
          return { status: res.status, json: json };
        });
      })
      .then(function (r) {
        if (r.status === 200 && r.json && r.json.success) {
          if (r.json.unlock) {
            setLoading(form, false);
            unlock(r.json);
          } else {
            window.location.href = resolveRedirect(r.json.redirect);
          }
          return;
        }
        setLoading(form, false);
        if (r.status === 404) {
          showError(form, "Esta página não está recebendo cadastros no momento.");
        } else {
          showError(form, (r.json && r.json.error) || "Erro ao enviar. Tente novamente.");
        }
      })
      .catch(function () {
        setLoading(form, false);
        showError(form, "Erro de conexão. Tente novamente.");
      });
  });
})();
