/**
 * DQ lead-capture.js — captação de leads das páginas externas.
 *
 * Uso: incluir este script na página e um <form class="dq-lead-form" data-slug="nome-da-isca">
 * (snippet canônico em /templates/formulario.html). O slug DEVE ser o mesmo cadastrado
 * na tela "Captação Externa" do CRM (e igual ao nome da pasta em /iscas/).
 *
 * TODA a apresentação (títulos, copy, botão, página de obrigado) é ESTÁTICA no HTML —
 * o HTML é a fonte única de verdade. Este script só intercepta o submit:
 * envia nome/whatsapp/email + UTMs da URL ao CRM e redireciona conforme a resposta
 * (whatsapp / grupo / página de obrigado da própria isca).
 *
 * Endpoint público (sem secret — o acionamento do UnniChat acontece no servidor).
 */
(function () {
  "use strict";

  var API_URL = "https://kqvwmmiguoqfuseabmtt.supabase.co/functions/v1/api-pagina-externa";

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
    var params = new URLSearchParams(window.location.search);
    var utms = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) {
      var v = params.get(k);
      if (v) utms[k] = v;
    });
    return utms;
  }

  function setError(form, msg) {
    var box = form.querySelector("[data-dq-error]");
    if (!box) {
      box = document.createElement("p");
      box.setAttribute("data-dq-error", "");
      box.style.color = "#c0392b";
      box.style.fontSize = "0.875rem";
      form.appendChild(box);
    }
    box.textContent = msg || "";
    box.style.display = msg ? "block" : "none";
  }

  function setLoading(form, loading) {
    var btn = form.querySelector('button[type="submit"], [data-dq-submit]');
    if (!btn) return;
    if (loading) {
      btn.dataset.dqLabel = btn.textContent;
      btn.textContent = "Enviando...";
      btn.disabled = true;
    } else {
      if (btn.dataset.dqLabel) btn.textContent = btn.dataset.dqLabel;
      btn.disabled = false;
    }
  }

  function initForm(form) {
    var slug = form.getAttribute("data-slug");
    if (!slug) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      setError(form, "");

      var nome = (form.querySelector('[name="nome"]') || {}).value || "";
      var whatsapp = (form.querySelector('[name="whatsapp"]') || {}).value || "";
      var email = (form.querySelector('[name="email"]') || {}).value || "";

      if (!nome.trim() || !whatsapp.trim()) {
        setError(form, "Preencha nome e WhatsApp.");
        return;
      }

      var payload = { action: "submit", slug: slug, nome: nome.trim(), whatsapp: whatsapp.trim() };
      if (email.trim()) payload.email = email.trim();
      var utms = getUtms();
      for (var k in utms) payload[k] = utms[k];

      setLoading(form, true);
      fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          return res.json().then(function (json) {
            return { status: res.status, json: json };
          });
        })
        .then(function (res) {
          if (res.status === 200 && res.json && res.json.success) {
            window.location.href = resolveRedirect(res.json.redirect);
          } else if (res.status === 404) {
            setLoading(form, false);
            setError(form, "Esta página não está recebendo cadastros no momento.");
          } else {
            setLoading(form, false);
            setError(form, (res.json && res.json.error) || "Erro ao enviar. Tente novamente.");
          }
        })
        .catch(function () {
          setLoading(form, false);
          setError(form, "Erro de conexão. Tente novamente.");
        });
    });
  }

  function boot() {
    var forms = document.querySelectorAll("form.dq-lead-form[data-slug]");
    for (var i = 0; i < forms.length; i++) initForm(forms[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
