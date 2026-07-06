/* =====================================================================
   Pesquisa / padrao — diagnóstico multi-step (transpõe FormPesquisa.tsx)
   intro → 3 dados → área cascata → 7 perguntas → submit → brinde
   ===================================================================== */
(function () {
  "use strict";

  var SUPA = "https://kqvwmmiguoqfuseabmtt.supabase.co";
  var ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxdndtbWlndW9xZnVzZWFibXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1Mjc2MTAsImV4cCI6MjA4OTEwMzYxMH0.61Qh2PKIHXJDtWHXiG-l5-u3NSKYUu9q25om2ABzG2o";
  var PAGINA = "pesquisa/padrao";

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- helpers de utm / cookie / telefone ---------- */
  function getParam(n) { try { return new URLSearchParams(window.location.search).get(n); } catch (e) { return null; } }

  function setLeadCookie(id) {
    if (!id) return;
    var dom = window.location.hostname.indexOf("dissecandoquestoes.com") !== -1 ? "; domain=.dissecandoquestoes.com" : "";
    document.cookie = "dq_lead_id=" + id + "; path=/; max-age=2592000; SameSite=Lax" + dom;
  }

  // normalizeWhatsApp (formUtils.ts): já-normalizado (55+12..) mantém; 10/11 dígitos prefixa 55
  function normalizeWhatsApp(raw) {
    var d = (raw || "").replace(/\D/g, "");
    if (d.indexOf("55") === 0 && d.length >= 12) return d;
    if (d.length === 10 || d.length === 11) return "55" + d;
    return d;
  }

  // formatWhatsAppInput (formUtils.ts) — máscara (99) 9 9999-9999
  function formatWhatsAppInput(value) {
    var d = (value || "").replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return "(" + d;
    if (d.length <= 3) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 7) return "(" + d.slice(0, 2) + ") " + d[2] + " " + d.slice(3);
    return "(" + d.slice(0, 2) + ") " + d[2] + " " + d.slice(3, 7) + "-" + d.slice(7, 11);
  }

  // validateWhatsApp (formUtils.ts) — 11 dígitos, 3º dígito = 9
  function validateWhatsApp(masked) {
    var d = (masked || "").replace(/\D/g, "");
    if (d.length !== 11) return { valid: false, error: "Informe um WhatsApp válido com DDD + 9 + número (11 dígitos)" };
    if (d[2] !== "9") return { valid: false, error: "Informe um WhatsApp válido com DDD + 9 + número (11 dígitos)" };
    return { valid: true, error: "" };
  }

  /* ---------- perguntas (cópia fiel do QUESTIONS do componente) ---------- */
  var QUESTIONS = [
    {
      chave: "q1_perfil",
      label: "Hoje você é:",
      tipo: "radio",
      opcoes: [
        "Professor concursado (rede estadual ou municipal)",
        "Professor da rede privada",
        "Professor substituto, REDA ou contrato temporário",
        "Professor do ensino superior privado",
        "Inativo (sem vínculo em sala no momento)",
        "Ainda não sou professor, mas quero ingressar na carreira pública"
      ]
    },
    {
      chave: "q2_preparacao",
      label: "Sobre sua preparação para o concurso do IF:",
      tipo: "radio",
      opcoes: [
        "Quero ser aprovado(a) ainda em 2026",
        "Tenho interesse, mas ainda não comecei a me preparar",
        "Já estou estudando, mas me sinto perdido(a)",
        "Estou apenas curioso(a), ainda não decidi se vou fazer o concurso"
      ]
    },
    {
      chave: "q3_desejo",
      label: "O que você mais deseja neste momento da sua jornada?",
      tipo: "textarea",
      placeholder: "Conte-nos o que mais importa para você agora..."
    },
    {
      chave: "q4_sentimento",
      label: "Qual dessas frases mais se aproxima do que você sente hoje?",
      tipo: "radio",
      opcoes: [
        "Eu ensino, mas ainda não tenho a estabilidade que mereço",
        "Já sei o conteúdo, o que me falta é uma estratégia eficaz",
        "Não tenho tempo para errar de novo, quero algo que funcione",
        "Estou cansado de estudar errado e não sair do lugar"
      ]
    },
    {
      chave: "q5_desafio",
      label: "Fale com sinceridade: Qual tem sido o seu maior desafio ou dificuldade na hora de se preparar para o concurso do IF?",
      tipo: "textarea",
      placeholder: "Descreva seu maior desafio..."
    },
    {
      chave: "q6_programa",
      label: "Sobre participar de um programa de acompanhamento estratégico voltado para professores que querem conquistar uma das 10 mil vagas nos Institutos Federais...",
      tipo: "radio",
      opcoes: [
        "Dependendo do valor, é o que eu mais preciso",
        "Acho fundamental hoje em dia, mas não posso investir",
        "Mesmo que demore muito tempo, eu prefiro aprender sozinho(a)"
      ]
    },
    {
      chave: "q7_guia",
      label: "Deseja receber o mini-guia gratuito com o passo a passo inicial?",
      tipo: "radio",
      opcoes: ["Sim, quero agora!", "Não, obrigado(a)"]
    }
  ];

  var DATA_STEPS = [
    { chave: "nome", label: "Qual é o seu nome completo?", tipo: "text", placeholder: "Seu nome completo" },
    { chave: "email", label: "Qual é o seu melhor e-mail?", tipo: "email", placeholder: "seu@email.com" },
    { chave: "whatsapp", label: "Qual é o seu WhatsApp?", tipo: "phone", placeholder: "(73) 9 9999-0002" }
  ];

  var TOTAL_Q = QUESTIONS.length;
  var TOTAL_STEPS = DATA_STEPS.length + 1 + TOTAL_Q; // dados + area + perguntas

  /* ---------- estado ---------- */
  var state = {
    nome: "",
    email: "",
    whatsapp: "",
    dataStep: 0,
    grandeAreaId: "",
    subAreaId: "",
    areaOutro: "",
    step: 0,
    respostas: {},
    completed: false,
    submitting: false
  };
  var areas = [];

  // pré-preenche whatsapp de ?whatsapp=
  (function () {
    var wp = getParam("whatsapp") || "";
    if (wp) state.whatsapp = formatWhatsAppInput(wp.replace(/^55/, ""));
  })();

  /* ---------- utilitários DOM ---------- */
  function show(el) { el.classList.remove("hidden"); }
  function hide(el) { el.classList.add("hidden"); }

  function grandesAreas() { return areas.filter(function (a) { return a.nivel === 1; }); }
  function subAreasOf(paiId) { return areas.filter(function (a) { return a.nivel === 2 && a.pai_id === paiId; }); }
  function findArea(id) { for (var i = 0; i < areas.length; i++) { if (areas[i].id === id) return areas[i]; } return null; }
  function selectedSub() { return findArea(state.subAreaId); }
  function isOutros() { var s = selectedSub(); return !!(s && s.nome === "Outros"); }

  /* ---------- progress ---------- */
  function currentStepLabel(phase) {
    if (phase === "data") return state.dataStep + 1;
    if (phase === "area") return DATA_STEPS.length + 1;
    return DATA_STEPS.length + 1 + state.step + 1;
  }
  function progressPct(phase) {
    if (state.completed) return 100;
    if (phase === "data") return ((state.dataStep + 1) / TOTAL_STEPS) * 100;
    if (phase === "area") return ((DATA_STEPS.length + 1) / TOTAL_STEPS) * 100;
    return ((DATA_STEPS.length + 1 + state.step + 1) / TOTAL_STEPS) * 100;
  }
  function updateChrome(phase) {
    if (state.completed) {
      $("stepCount").textContent = "";
      $("progressFill").style.width = "100%";
      hide($("backHolder"));
      return;
    }
    $("stepCount").textContent = currentStepLabel(phase) + "/" + TOTAL_STEPS;
    $("progressFill").style.width = progressPct(phase) + "%";
    show($("backHolder"));
  }

  /* ---------- panels ---------- */
  var PANELS = ["panelData", "panelArea", "panelQuestions", "panelDone"];
  function showPanel(id) {
    PANELS.forEach(function (p) { hide($(p)); });
    show($(id));
  }

  // animação de saída/entrada (mesma cadência do componente: 300ms)
  function animOut(panelEl, cb) {
    panelEl.classList.add("anim-out");
    setTimeout(function () { panelEl.classList.remove("anim-out"); cb(); }, 300);
  }

  /* ================= INTRO ================= */
  $("startBtn").addEventListener("click", function () {
    hide($("introScreen"));
    show($("flowScreen"));
    renderData();
  });

  /* ================= DADOS ================= */
  function renderData() {
    showPanel("panelData");
    var ds = DATA_STEPS[state.dataStep];
    $("dataLabel").textContent = ds.label;
    var holder = $("dataInputHolder");
    hide($("dataError"));

    if (ds.tipo === "phone") {
      holder.innerHTML =
        '<div class="phone-wrap">' +
        '<div class="phone-ddd" id="dddBox">+55</div>' +
        '<input type="text" inputmode="numeric" id="fieldInput" class="phone-inp" placeholder="' + ds.placeholder + '" maxlength="17" autocomplete="tel">' +
        "</div>";
      var pin = $("fieldInput");
      pin.value = state.whatsapp;
      pin.addEventListener("input", function () {
        state.whatsapp = formatWhatsAppInput(this.value);
        this.value = state.whatsapp;
        hide($("dataError")); this.classList.remove("err"); $("dddBox").classList.remove("err");
        toggleDataContinue();
      });
      pin.addEventListener("keydown", onDataKey);
    } else {
      holder.innerHTML =
        '<input type="' + ds.tipo + '" id="fieldInput" class="inp" placeholder="' + ds.placeholder + '" autocomplete="' + (ds.chave === "email" ? "email" : "name") + '">';
      var inp = $("fieldInput");
      inp.value = state.dataStep === 0 ? state.nome : state.email;
      inp.addEventListener("input", function () {
        if (state.dataStep === 0) state.nome = this.value; else state.email = this.value;
        hide($("dataError")); this.classList.remove("err");
        toggleDataContinue();
      });
      inp.addEventListener("keydown", onDataKey);
    }
    try { $("fieldInput").focus(); } catch (e) {}
    toggleDataContinue();
    updateChrome("data");
  }

  function isDataStepValid() {
    if (state.dataStep === 0) return state.nome.trim().length >= 2;
    if (state.dataStep === 1) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim());
    if (state.dataStep === 2) return validateWhatsApp(state.whatsapp).valid;
    return true;
  }
  function toggleDataContinue() {
    var b = $("dataContinue");
    if (isDataStepValid()) show(b); else hide(b);
  }
  function onDataKey(e) { if (e.key === "Enter") { e.preventDefault(); goDataForward(); } }

  $("dataContinue").addEventListener("click", goDataForward);

  function goDataForward() {
    if (!isDataStepValid()) {
      var msg;
      if (state.dataStep === 0) msg = "Por favor, insira seu nome completo (mínimo 2 caracteres)";
      else if (state.dataStep === 1) msg = "Por favor, insira um e-mail válido";
      else msg = validateWhatsApp(state.whatsapp).error || "Por favor, insira um WhatsApp válido";
      var er = $("dataError"); er.textContent = msg; show(er);
      var fi = $("fieldInput"); if (fi) fi.classList.add("err");
      if (state.dataStep === 2 && $("dddBox")) $("dddBox").classList.add("err");
      return;
    }
    animOut($("panelData"), function () {
      if (state.dataStep < DATA_STEPS.length - 1) { state.dataStep++; renderData(); }
      else { renderArea(); }
    });
  }

  /* ================= ÁREA (cascata) ================= */
  function fetchAreas() {
    var url = SUPA + "/rest/v1/areas_formacao?ativo=eq.true&select=id,nome,nivel,pai_id&order=nome";
    fetch(url, { headers: { apikey: ANON, Authorization: "Bearer " + ANON } })
      .then(function (r) { return r.json(); })
      .then(function (data) { if (Array.isArray(data)) { areas = data; populateGrande(); } })
      .catch(function () {});
  }

  function populateGrande() {
    var sel = $("selGrande");
    if (!sel) return;
    var opts = '<option value="" disabled' + (state.grandeAreaId ? "" : " selected") + '>Selecione sua área</option>';
    grandesAreas().forEach(function (ga) {
      opts += '<option value="' + ga.id + '"' + (ga.id === state.grandeAreaId ? " selected" : "") + ">" + esc(ga.nome) + "</option>";
    });
    sel.innerHTML = opts;
    if (state.grandeAreaId) populateSub();
  }

  function populateSub() {
    var sel = $("selSub");
    if (!sel) return;
    if (!state.grandeAreaId) {
      sel.disabled = true;
      sel.innerHTML = '<option value="" disabled selected>Selecione a área primeiro</option>';
      return;
    }
    sel.disabled = false;
    var opts = '<option value="" disabled' + (state.subAreaId ? "" : " selected") + ">Selecione a sub-área</option>";
    subAreasOf(state.grandeAreaId).forEach(function (sa) {
      opts += '<option value="' + sa.id + '"' + (sa.id === state.subAreaId ? " selected" : "") + ">" + esc(sa.nome) + "</option>";
    });
    sel.innerHTML = opts;
  }

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  function renderArea() {
    showPanel("panelArea");
    populateGrande();
    populateSub();
    syncOutro();
    hide($("areaError"));
    toggleAreaContinue();
    updateChrome("area");
    try { $("selGrande").focus(); } catch (e) {}
  }

  function syncOutro() {
    var wrap = $("outroWrap");
    if (isOutros()) { wrap.classList.add("open"); }
    else { wrap.classList.remove("open"); }
    $("areaOutro").value = state.areaOutro;
  }

  function isAreaValid() {
    if (!state.grandeAreaId || !state.subAreaId) return false;
    if (isOutros() && state.areaOutro.trim().length === 0) return false;
    return true;
  }
  function toggleAreaContinue() {
    var b = $("areaContinue");
    if (isAreaValid()) show(b); else hide(b);
  }

  $("selGrande").addEventListener("change", function () {
    state.grandeAreaId = this.value;
    state.subAreaId = "";
    state.areaOutro = "";
    hide($("areaError"));
    populateSub(); syncOutro(); toggleAreaContinue();
  });
  $("selSub").addEventListener("change", function () {
    state.subAreaId = this.value;
    state.areaOutro = "";
    hide($("areaError"));
    syncOutro(); toggleAreaContinue();
  });
  $("areaOutro").addEventListener("input", function () {
    state.areaOutro = this.value;
    hide($("areaError")); toggleAreaContinue();
  });
  $("areaOutro").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); goAreaForward(); }
  });
  $("areaContinue").addEventListener("click", goAreaForward);

  function goAreaForward() {
    if (!isAreaValid()) {
      var msg;
      if (!state.grandeAreaId) msg = "Selecione sua área de formação";
      else if (!state.subAreaId) msg = "Selecione a sub-área";
      else msg = "Especifique sua área de formação";
      var er = $("areaError"); er.textContent = msg; show(er);
      return;
    }
    animOut($("panelArea"), function () { renderQuestion(); });
  }

  /* ================= PERGUNTAS ================= */
  function renderQuestion() {
    showPanel("panelQuestions");
    var q = QUESTIONS[state.step];
    $("qPill").textContent = "Pergunta " + (state.step + 1) + " de " + TOTAL_Q;
    $("qLabel").textContent = q.label;
    var body = $("qBody");

    if (q.tipo === "radio") {
      var html = '<div class="stack-tight">';
      for (var i = 0; i < q.opcoes.length; i++) {
        var opt = q.opcoes[i];
        var on = state.respostas[q.chave] === opt;
        html +=
          '<button class="opt' + (on ? " on" : "") + '" data-opt="' + esc(opt) + '">' +
          '<span style="padding-right:12px">' + esc(opt) + "</span>" +
          '<span class="check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>' +
          "</button>";
      }
      html += "</div>";
      body.innerHTML = html;
      var btns = body.querySelectorAll(".opt");
      for (var j = 0; j < btns.length; j++) {
        btns[j].addEventListener("click", function () { handleSelect(this.getAttribute("data-opt"), this); });
      }
    } else if (q.tipo === "textarea") {
      body.innerHTML =
        '<div class="stack">' +
        '<textarea class="inp" id="qText" rows="4" placeholder="' + esc(q.placeholder || "Sua resposta") + '"></textarea>' +
        '<button class="btn-continue hidden" id="qContinue">Continuar <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>' +
        "</div>";
      var ta = $("qText");
      ta.value = state.respostas[q.chave] || "";
      var toggle = function () { if (ta.value.trim().length > 0) show($("qContinue")); else hide($("qContinue")); };
      ta.addEventListener("input", toggle);
      $("qContinue").addEventListener("click", handleTextSubmit);
      toggle();
      try { ta.focus(); } catch (e) {}
    } else {
      // text
      body.innerHTML =
        '<div class="stack">' +
        '<input type="text" class="inp" id="qText" placeholder="' + esc(q.placeholder || "Sua resposta") + '">' +
        '<button class="btn-continue hidden" id="qContinue">Continuar <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>' +
        "</div>";
      var ti = $("qText");
      ti.value = state.respostas[q.chave] || "";
      var toggle2 = function () { if (ti.value.trim().length > 0) show($("qContinue")); else hide($("qContinue")); };
      ti.addEventListener("input", toggle2);
      ti.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); handleTextSubmit(); } });
      $("qContinue").addEventListener("click", handleTextSubmit);
      toggle2();
      try { ti.focus(); } catch (e) {}
    }
    updateChrome("questions");
  }

  function handleSelect(option, btnEl) {
    var q = QUESTIONS[state.step];
    state.respostas[q.chave] = option;
    // marca visual
    var btns = $("qBody").querySelectorAll(".opt");
    for (var k = 0; k < btns.length; k++) btns[k].classList.remove("on");
    if (btnEl) btnEl.classList.add("on");
    // auto-advance (~450ms como o componente)
    setTimeout(goForward, 450);
  }

  function handleTextSubmit() {
    var q = QUESTIONS[state.step];
    var el = $("qText");
    var v = (el ? el.value : "").trim();
    if (v.length === 0) return;
    state.respostas[q.chave] = v;
    goForward();
  }

  function goForward() {
    animOut($("panelQuestions"), function () {
      if (state.step < TOTAL_Q - 1) { state.step++; renderQuestion(); }
      else { completeAndSubmit(); }
    });
  }

  /* ================= NAVEGAÇÃO — VOLTAR ================= */
  $("backBtn").addEventListener("click", function () {
    if (!$("panelData").classList.contains("hidden")) { goDataBack(); return; }
    if (!$("panelArea").classList.contains("hidden")) { goAreaBack(); return; }
    if (!$("panelQuestions").classList.contains("hidden")) { goQuestionBack(); return; }
  });

  function goDataBack() {
    hide($("dataError"));
    if (state.dataStep === 0) {
      // volta para intro
      hide($("flowScreen"));
      show($("introScreen"));
      return;
    }
    animOut($("panelData"), function () { state.dataStep--; renderData(); });
  }

  function goAreaBack() {
    hide($("areaError"));
    animOut($("panelArea"), function () {
      state.dataStep = DATA_STEPS.length - 1;
      renderData();
    });
  }

  function goQuestionBack() {
    if (state.step <= 0) {
      animOut($("panelQuestions"), function () { renderArea(); });
      return;
    }
    animOut($("panelQuestions"), function () { state.step--; renderQuestion(); });
  }

  /* ================= SUBMIT ================= */
  function buildAreaFormacaoString() {
    var ga = findArea(state.grandeAreaId);
    var sa = findArea(state.subAreaId);
    if (!ga || !sa) return "";
    if (sa.nome === "Outros" && state.areaOutro.trim()) {
      return ga.nome + " - Outros: " + state.areaOutro.trim();
    }
    return ga.nome + " - " + sa.nome;
  }

  function completeAndSubmit() {
    if (state.submitting) return;
    state.submitting = true;
    state.completed = true;
    showPanel("panelDone");
    updateChrome("questions");

    var respostas = {};
    for (var k in state.respostas) { if (state.respostas.hasOwnProperty(k)) respostas[k] = state.respostas[k]; }
    respostas.area_formacao = buildAreaFormacaoString();

    var normalizedWa = normalizeWhatsApp(state.whatsapp);
    var payload = {
      tipo: "pesquisa",
      whatsapp: normalizedWa,
      email: state.email.trim(),
      nome: state.nome.trim(),
      respostas: respostas,
      area_formacao_id: state.subAreaId || null,
      area_outro_texto: isOutros() ? state.areaOutro.trim() : null
    };

    // timeout 20s — botão/fluxo nunca fica preso
    var ctrl, timer;
    try { ctrl = new AbortController(); timer = setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, 20000); } catch (e) { ctrl = null; }

    var opts = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    };
    if (ctrl) opts.signal = ctrl.signal;

    fetch(SUPA + "/functions/v1/api-formulario", opts)
      .then(function (r) {
        if (timer) clearTimeout(timer);
        if (!r.ok) throw new Error("http " + r.status);
        return r.json();
      })
      .then(function (res) {
        try { setLeadCookie(res && res.lead_id); } catch (e) {}
        try { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: "SurveyCompleted", content_name: PAGINA }); } catch (e) {}
        redirectToBrinde(normalizedWa);
      })
      .catch(function () {
        if (timer) clearTimeout(timer);
        // libera o fluxo de novo, mostra erro na última pergunta
        state.submitting = false;
        state.completed = false;
        showPanel("panelQuestions");
        renderQuestion();
        var body = $("qBody");
        var er = document.createElement("p");
        er.className = "field-err";
        er.style.marginTop = "12px";
        er.textContent = "Erro ao enviar respostas. Tente novamente.";
        body.appendChild(er);
        updateChrome("questions");
      });
  }

  function redirectToBrinde(normalizedWa) {
    // preserva a query da sessão (utms/fbclid) e injeta ?whatsapp=normalizado
    // (o destino é /brinde/pesquisa/ — a pasta /brinde/padrao/ não existe no site;
    //  o index de brinde/pesquisa consome o ?whatsapp= pra marcar acessou_brinde)
    var base = "../../brinde/pesquisa/";
    var search = window.location.search || "";
    var params;
    try { params = new URLSearchParams(search); } catch (e) { params = new URLSearchParams(); }
    params.set("whatsapp", normalizedWa);
    window.location.href = base + "?" + params.toString();
  }

  /* ================= PING VISITA ================= */
  try {
    fetch(SUPA + "/rest/v1/rpc/fn_registrar_visita", {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON, Authorization: "Bearer " + ANON },
      body: JSON.stringify({ p_pagina: PAGINA })
    }).catch(function () {});
  } catch (e) {}

  /* ================= INIT ================= */
  fetchAreas();
})();
