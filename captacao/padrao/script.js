(function () {
  "use strict";

  // Página captacao/padrao — comportamento ESPECÍFICO da página:
  //   (1) scroll suave dos CTAs [data-scroll-form] até o formulário;
  //   (2) ping de visita (fire-and-forget).
  //
  // O SUBMIT do lead (nome/whatsapp/email + UTMs), a MÁSCARA de WhatsApp e o
  // acionamento do UnniChat NÃO vivem mais aqui — migraram para o contrato v2
  // (form.dq-lead-form + /assets/js/lead-capture.js). O UnniChat agora é acionado
  // pelo SERVIDOR do CRM (não mais no browser). O final pós-cadastro é governado
  // pela tela do CRM (tipo_final=link_externo → destino /obrigado/padrao/).

  var SUPABASE_URL = "https://kqvwmmiguoqfuseabmtt.supabase.co";
  var ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxdndtbWlndW9xZnVzZWFibXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1Mjc2MTAsImV4cCI6MjA4OTEwMzYxMH0.61Qh2PKIHXJDtWHXiG-l5-u3NSKYUu9q25om2ABzG2o";
  var PAGINA = "captacao/padrao";

  // ------- botões de scroll para o form -------
  function scrollToForm() {
    // desktop tem o form dentro do hero; mobile no bloco abaixo — escolhe o visível
    var desk = document.querySelector(".hero-desk .leadform");
    var mob = document.querySelector(".mob-formblock .leadform");
    var target = desk || mob;
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

  // ------- init: liga os CTAs de scroll -------
  try {
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
