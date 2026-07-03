# Manual da Designer — Páginas DQ

> **O guia completo, passo a passo, está no CRM** (repositório `dq-crm`):
> `docs/MANUAL-PAGINAS-DESIGNER.md`. Peça o link ao Manoel ou abra por lá.

Resumo de 30 segundos (o guia completo tem os detalhes e os prompts prontos):

- **Site = apresentação** (este repositório: HTML, texto, imagens, layout — seu).
- **CRM = comportamento** (tela Páginas → Captação Externa: para onde vai, campanha,
  checkout, automação de WhatsApp — você configura sem código).
- URLs: `site.dissecandoquestoes.com/{seção}/{página}/`.
- **Nunca toque:** `assets/js/`, o `<script>` do GTM, os atributos `data-*`, o
  `<form class="dq-lead-form">`, o `.nojekyll`, a pasta `templates/`.
- **Sempre teste** com o seu próprio contato depois de publicar.
- Detalhes técnicos de como o sistema funciona: veja o `CLAUDE.md` deste repositório.

Fluxo rápido:
1. Garanta a **seção** no CRM (botão Seções).
2. (Se tiver WhatsApp) peça o **link de acionamento** ao Manoel.
3. **Cadastre a página** no CRM (seção, slug, final, campos, campanha, checkout).
4. Peça o **layout** ao seu Claude (prompt-modelo no guia completo).
5. **Publique** (commit/push → GitHub Pages, 1–5 min) e **teste**.
