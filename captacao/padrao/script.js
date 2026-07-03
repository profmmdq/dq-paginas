(function () {
  "use strict";

  var SUPABASE_URL = "https://kqvwmmiguoqfuseabmtt.supabase.co";
  var ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxdndtbWlndW9xZnVzZWFibXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1Mjc2MTAsImV4cCI6MjA4OTEwMzYxMH0.61Qh2PKIHXJDtWHXiG-l5-u3NSKYUu9q25om2ABzG2o";
  var UNNICHAT_URL = "https://unnichat.com.br/a/start/OITsOJrASWjmtfu8o9Or";
  var PAGINA = "captacao/padrao";
  var REDIRECT = "../../obrigado/padrao/";

  // ------- helpers -------
  function uuid() {
    try {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    } catch (e) {}
    return "e" + Date.now() + Math.random().toString(16).slice(2);
  }

  function getUtm(name) {
    try {
      return new URLSearchParams(window.location.search).get(name) || "";
    } catch (e) {
      return "";
    }
  }

  function getCookie(re) {
    try {
      var m = document.cookie.match(re);
      return m ? m[1] : undefined;
    } catch (e) {
      return undefined;
    }
  }

  function writeLeadId(id) {
    if (!id) return;
    try {
      var suffix =
        location.hostname.indexOf("dissecandoquestoes.com") !== -1
          ? "; domain=.dissecandoquestoes.com"
          : "";
      document.cookie =
        "dq_lead_id=" + id + "; path=/; max-age=2592000; SameSite=Lax" + suffix;
    } catch (e) {}
  }

  // ------- máscara de whatsapp: (DD) 9 XXXX-XXXX -------
  function formatWhatsApp(value) {
    var d = (value || "").replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return "(" + d;
    if (d.length <= 3) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 7) return "(" + d.slice(0, 2) + ") " + d[2] + " " + d.slice(3);
    return "(" + d.slice(0, 2) + ") " + d[2] + " " + d.slice(3, 7) + "-" + d.slice(7, 11);
  }

  // 11 dígitos, 3º = 9
  function validateWhatsApp(masked) {
    var digits = (masked || "").replace(/\D/g, "");
    if (digits.length !== 11 || digits[2] !== "9") {
      return {
        valid: false,
        digits: digits,
        error: "Informe um WhatsApp válido com DDD + 9 + número (11 dígitos)",
      };
    }
    return { valid: true, digits: digits, error: "" };
  }

  // normaliza para 55DD9XXXXXXXX
  function normalizeWhatsApp(raw) {
    var digits = (raw || "").replace(/\D/g, "");
    if (digits.indexOf("55") === 0 && digits.length >= 12) return digits;
    if (digits.length === 10 || digits.length === 11) return "55" + digits;
    return digits;
  }

  // ------- ligar comportamento a um form -------
  function wireForm(form) {
    if (!form) return;
    var nomeEl = form.querySelector('input[name="nome"]');
    var emailEl = form.querySelector('input[name="email"]');
    var waEl = form.querySelector('input[name="whatsapp"]');
    var waPrefix = form.querySelector("[data-wa-prefix]");
    var waErr = form.querySelector("[data-wa-err]");
    var btn = form.querySelector("button.cta");
    var spinner = form.querySelector(".spinner");
    var label = form.querySelector("[data-cta-label]");
    var errBox = form.querySelector("[data-dq-error]");

    function showErr(txt) {
      if (!errBox) return;
      errBox.textContent = txt;
      errBox.classList.add("show");
    }
    function clearErr() {
      if (errBox) {
        errBox.textContent = "";
        errBox.classList.remove("show");
      }
    }
    function setWaError(txt) {
      if (waEl) waEl.classList.toggle("errfield", !!txt);
      if (waPrefix) waPrefix.classList.toggle("errfield", !!txt);
      if (waErr) waErr.textContent = txt || "";
    }
    function setLoading(on) {
      if (btn) btn.disabled = !!on;
      if (spinner) spinner.style.display = on ? "inline-block" : "none";
      if (label) label.textContent = on ? "Enviando..." : label.getAttribute("data-orig") || label.textContent;
    }

    if (label && !label.getAttribute("data-orig")) {
      label.setAttribute("data-orig", label.textContent);
    }

    // máscara ao digitar
    if (waEl) {
      waEl.addEventListener("input", function () {
        waEl.value = formatWhatsApp(waEl.value);
        setWaError("");
      });
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (btn && btn.disabled) return;
      clearErr();

      var nome = nomeEl ? nomeEl.value.trim() : "";
      var email = emailEl ? emailEl.value.trim() : "";
      var waRaw = waEl ? waEl.value : "";
      var wa = validateWhatsApp(waRaw);

      if (!nome || !email || !wa.valid) {
        if (!wa.valid) setWaError(wa.error);
        showErr("Preencha todos os campos corretamente.");
        return;
      }
      setWaError("");
      setLoading(true);

      var normalized = normalizeWhatsApp(waRaw);
      var utm = {
        utm_source: getUtm("utm_source"),
        utm_medium: getUtm("utm_medium"),
        utm_campaign: getUtm("utm_campaign"),
        utm_content: getUtm("utm_content"),
        utm_term: getUtm("utm_term"),
      };
      var capiEventId = uuid();

      // fbclid: URL + persistência em sessionStorage
      var fbclid = getUtm("fbclid") || undefined;
      try {
        if (fbclid) sessionStorage.setItem("dq_fbclid", fbclid);
        else fbclid = sessionStorage.getItem("dq_fbclid") || undefined;
      } catch (e) {}
      var fbp = getCookie(/_fbp=([^;]+)/) || undefined;

      var payload = {
        tipo: "captacao",
        nome: nome,
        email: email,
        whatsapp: normalized,
        fonte: null,
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        utm_content: utm.utm_content,
        utm_term: utm.utm_term,
        capi_event_id: capiEventId,
        fbclid: fbclid,
        fbp: fbp,
        pagina_url: window.location.href,
        subfonte: "",
      };

      var ctl, to;
      try {
        ctl = new AbortController();
        to = setTimeout(function () {
          try { ctl.abort(); } catch (e) {}
        }, 20000);
      } catch (e) {}

      var opts = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      };
      if (ctl) opts.signal = ctl.signal;

      fetch(SUPABASE_URL + "/functions/v1/api-formulario", opts)
        .then(function (resp) {
          if (to) clearTimeout(to);
          if (!resp.ok) {
            return resp
              .json()
              .catch(function () { return {}; })
              .then(function (e) {
                throw new Error(e && e.error ? e.error : "Erro ao enviar");
              });
          }
          return resp.json();
        })
        .then(function (res) {
          var leadId = res && res.lead_id;
          // (a) cookie dq_lead_id (domínio compartilhado)
          writeLeadId(leadId);

          // (b) webhook UnniChat (fire-and-forget)
          try {
            fetch(UNNICHAT_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nome: nome,
                email: email,
                telefone: "+" + normalized,
                utm_source: utm.utm_source,
                utm_medium: utm.utm_medium,
                utm_campaign: utm.utm_campaign,
                utm_content: utm.utm_content,
                utm_term: utm.utm_term,
              }),
            }).catch(function () {});
          } catch (e) {}

          // (c) dataLayer Lead — MESMO capi_event_id (dedup browser×server)
          try {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
              event: "Lead",
              event_id: capiEventId,
              lead_id: leadId || undefined,
              content_name: PAGINA,
            });
          } catch (e) {}

          // (d) redirect preservando a query
          window.location.href = REDIRECT + window.location.search;
        })
        .catch(function (err) {
          if (to) clearTimeout(to);
          setLoading(false);
          var msg =
            err && err.name === "AbortError"
              ? "A conexão demorou demais. Tente novamente."
              : "Erro ao enviar. Tente novamente.";
          showErr(msg);
        });
    });
  }

  // ------- botões de scroll para o form -------
  function scrollToForm() {
    // desktop tem o form dentro do hero; mobile no bloco abaixo
    var target =
      document.querySelector(".hero-desk .leadform") ||
      document.querySelector(".mob-formblock .leadform");
    // escolhe o visível
    var desk = document.querySelector(".hero-desk .leadform");
    var mob = document.querySelector(".mob-formblock .leadform");
    if (mob && mob.offsetParent !== null) target = mob;
    else if (desk && desk.offsetParent !== null) target = desk;
    if (target) {
      try {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (e) {
        target.scrollIntoView();
      }
    } else {
      try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) { window.scrollTo(0, 0); }
    }
  }

  // ------- init -------
  try {
    wireForm(document.getElementById("leadFormDesk"));
    wireForm(document.getElementById("leadFormMob"));

    var scrollBtns = document.querySelectorAll("[data-scroll-form]");
    for (var i = 0; i < scrollBtns.length; i++) {
      scrollBtns[i].addEventListener("click", scrollToForm);
    }
  } catch (e) {}

  // ------- ping de visita (fire-and-forget) -------
  try {
    fetch(SUPABASE_URL + "/rest/v1/rpc/fn_registrar_visita", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON,
        Authorization: "Bearer " + ANON,
      },
      body: JSON.stringify({ p_pagina: PAGINA }),
    }).catch(function () {});
  } catch (e) {}
})();
