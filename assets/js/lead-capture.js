/*
 * lead-capture.js v3 — captura de leads das páginas externas (dq-paginas → CRM DQ).
 *
 * v3 (M3 F18 — CAPI): o payload agora leva capi_event_id (gerado aqui e também
 * empurrado ao dataLayer como "Lead" para dedup browser×server quando a página
 * tem GTM/Pixel), fbclid (da URL, persistido em sessionStorage para sobreviver
 * à navegação interna), _fbp (cookie do Pixel) e pagina_url. O servidor dispara
 * o evento Lead na Conversions API com esses dados — NUNCA fabrique valores aqui.
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
 *
 * v3.1: máscara de WhatsApp BR centralizada aqui (formatLive / normalizeWhatsApp /
 * maskWhatsApp) — auto-aplicada a form.dq-lead-form input[name="whatsapp"]. Insere
 * o "9" do celular SÓ quando falta, preserva fixo (10 díg.) e o DDD 55 (Santa
 * Maria/RS), corta o +55 de código de país e o zero de tronco. O payload passa a
 * enviar dígitos nacionais normalizados (11 celular / 10 fixo). Uma página pode
 * desligar a máscara de um campo com o atributo data-dq-no-mask.
 */
(function () {
  "use strict";

  var API_URL = "https://kqvwmmiguoqfuseabmtt.supabase.co/functions/v1/api-pagina-externa";
  var RESERVED = { nome: 1, whatsapp: 1, email: 1 };
  // Bug-fix 02/jul: sem timeout, uma resposta lenta/pendurada do servidor deixava o
  // botão preso em "Enviando..." para sempre. Todo caminho (timeout incluso) DEVE
  // reabilitar o botão e mostrar mensagem.
  var REQUEST_TIMEOUT_MS = 20000;

  // Base do site derivada da localização deste script — funciona tanto em
  // site.dissecandoquestoes.com quanto em profmmdq.github.io/dq-paginas/
  var script = document.currentScript || document.querySelector('script[src*="lead-capture"]');
  var SITE_BASE = script && script.src ? script.src.replace(/\/assets\/js\/[^/]*$/, "") : "";

  function resolveRedirect(redirect) {
    if (!redirect) return SITE_BASE + "/";
    if (redirect.charAt(0) === "/") return SITE_BASE + redirect;
    return redirect;
  }

  // ── Máscara de WhatsApp BR (v3.1) ─────────────────────────────────────────
  // Lógica validada com testes (DDD 55 vs +55, fixo, celular sem o 9, zero de
  // tronco, colado/parcial). ORDEM das regras é crítica: tira zero à esquerda
  // ANTES de cortar o país (senão "071...", 12 díg., viraria falso +55); corta o
  // +55 só por COMPRIMENTO 12/13 (protege o DDD 55 de 11 díg.); insere o 9 só em
  // celular legado de 10 díg. cujo 3º dígito é 6-9 (fixo começa 2-5, não ganha 9).
  function onlyDigits(v) {
    if (v == null) return "";
    return String(v).replace(/[^0-9]/g, "");
  }
  function stripLeadingZeros(d) {
    var i = 0;
    while (i < d.length && d.charAt(i) === "0") i++;
    return d.slice(i);
  }
  // Dígitos nacionais canônicos: 11 (celular) / 10 (fixo) / <10 (incompleto).
  function normalizeWhatsApp(v) {
    var d = stripLeadingZeros(onlyDigits(v));
    if ((d.length === 12 || d.length === 13) && d.slice(0, 2) === "55") d = d.slice(2);
    if (d.length > 11) d = d.slice(0, 11);
    if (d.length === 10 && "6789".indexOf(d.charAt(2)) !== -1) d = d.slice(0, 2) + "9" + d.slice(2);
    return d;
  }
  function maskCanonical(d) {
    var n = d.length;
    if (n === 11) return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
    if (n === 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    if (n >= 7 && n <= 9) return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
    if (n >= 3 && n <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (n >= 1 && n <= 2) return "(" + d;
    return "";
  }
  function maskWhatsApp(v) { return maskCanonical(normalizeWhatsApp(v)); }
  // Máscara ao vivo: progressiva, NUNCA insere o 9 no meio da digitação.
  function formatLive(v) {
    var d = stripLeadingZeros(onlyDigits(v));
    if (d.length >= 12 && d.slice(0, 2) === "55") d = d.slice(2);
    if (d.length > 11) d = d.slice(0, 11);
    if (d.length <= 2) return d === "" ? "" : "(" + d;
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  }
  function isWhatsField(el) {
    return !!(el && el.name === "whatsapp" && el.form && el.form.classList &&
      el.form.classList.contains("dq-lead-form") && !el.hasAttribute("data-dq-no-mask"));
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

  // ── CAPI (v3) ────────────────────────────────────────────────────────────
  function getCookie(name) {
    var m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : null;
  }

  // fbclid da URL; persiste em sessionStorage (o clique no anúncio traz o fbclid
  // só na primeira URL — se o visitante navegar internamente antes de enviar,
  // ainda recuperamos). NUNCA inventado.
  function getFbclid() {
    try {
      var fromUrl = new URLSearchParams(window.location.search).get("fbclid");
      if (fromUrl) {
        sessionStorage.setItem("dq_fbclid", fromUrl);
        return fromUrl;
      }
      return sessionStorage.getItem("dq_fbclid");
    } catch (e) {
      return null;
    }
  }

  function newEventId() {
    try {
      if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    } catch (e) { /* fallback abaixo */ }
    return "dq-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
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

    // Blindagem: qualquer exceção síncrona daqui pra baixo reabilita o botão e
    // mostra mensagem (nunca deixar o usuário preso em "Enviando...").
    try {
      clearError(form);

      var nome = ((form.elements.nome && form.elements.nome.value) || "").trim();
      var whatsappRaw = ((form.elements.whatsapp && form.elements.whatsapp.value) || "").trim();
      var email = ((form.elements.email && form.elements.email.value) || "").trim();
      if (!nome || !whatsappRaw) {
        showError(form, "Preencha nome e WhatsApp.");
        return;
      }
      // Normaliza para dígitos nacionais (insere o 9 do celular quando falta) e
      // valida o comprimento — evita mandar telefone quebrado pro CRM.
      var whatsapp = normalizeWhatsApp(whatsappRaw);
      if (whatsapp.length < 10) {
        showError(form, "Confira o WhatsApp: informe DDD + número.");
        return;
      }
      if (form.elements.whatsapp) form.elements.whatsapp.value = maskWhatsApp(whatsappRaw);

      var payload = { action: "submit", secao: secao, slug: slug, nome: nome, whatsapp: whatsapp };
      if (email) payload.email = email;
      var extras = coletarExtras(form);
      if (extras) payload.extras = extras;
      var utms = getUtms();
      for (var k in utms) payload[k] = utms[k];

      // CAPI (v3): event_id compartilhado browser×server + sinais do Pixel
      var eventId = newEventId();
      payload.capi_event_id = eventId;
      payload.pagina_url = window.location.href;
      var fbclid = getFbclid();
      if (fbclid) payload.fbclid = fbclid;
      var fbp = getCookie("_fbp");
      if (fbp) payload.fbp = fbp;
      // Se a página tem GTM/Pixel, o push abaixo dispara o Lead client-side com o
      // MESMO event_id do server (dedup no Meta). Sem GTM: no-op inofensivo.
      try {
        if (window.dataLayer && window.dataLayer.push) {
          window.dataLayer.push({ event: "Lead", event_id: eventId });
        }
      } catch (e) { /* no-op */ }

      setLoading(form, true);

      var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      var timeoutId = controller
        ? setTimeout(function () { controller.abort(); }, REQUEST_TIMEOUT_MS)
        : null;

      fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined,
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (json) {
            return { status: res.status, json: json };
          });
        })
        .then(function (r) {
          if (timeoutId) clearTimeout(timeoutId);
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
        .catch(function (err) {
          if (timeoutId) clearTimeout(timeoutId);
          setLoading(form, false);
          if (err && err.name === "AbortError") {
            showError(form, "O envio demorou mais que o esperado. Tente novamente.");
          } else {
            showError(form, "Erro de conexão. Tente novamente.");
          }
        });
    } catch (e) {
      setLoading(form, false);
      showError(form, "Erro ao enviar. Tente novamente.");
    }
  });

  // Máscara nos campos WhatsApp dos form.dq-lead-form (delegação no document —
  // pega qualquer form, sem duplo-registro). "input" = máscara ao vivo;
  // "focusout" (blur borbulha) = forma canônica com o 9 inserido.
  document.addEventListener("input", function (ev) {
    var el = ev.target;
    if (isWhatsField(el)) el.value = formatLive(el.value);
  });
  document.addEventListener("focusout", function (ev) {
    var el = ev.target;
    if (isWhatsField(el) && el.value) el.value = maskWhatsApp(el.value);
  });
})();
