# DQ Páginas de Captação

## Sobre
Landing pages e iscas da Dissecando Questões (DQ), hospedadas em
lp.dissecandoquestoes.com via GitHub Pages. Público: professores
estudando pra concursos de Instituto Federal (IF), TAE, Magistério
Superior e Perícia Criminal.

## Marca
- Cores: laranja #f67828 (primária/CTA) e verde #6EA27C (secundária)
- Tom de voz: direto, técnico, motivador — "Dissecador" e "RAQUeR"
  fazem parte do vocabulário
- Nunca tom genérico de infoproduto — professor falando com professor

## Estrutura
Cada isca é uma pasta em /iscas/nome-da-isca/index.html.
CSS compartilhado em /assets/css/style.css — sempre reaproveitar,
evitar estilo inline exceto quando for específico daquela página.

## CTA padrão
Botão principal sempre leva pro WhatsApp:
https://wa.link/dq-consultor
(perguntar número e mensagem de cada campanha antes de gerar a página)

## Regras técnicas
- HTML/CSS puro, mobile-first, sem frameworks pesados
- Sempre incluir meta tags Open Graph (título, descrição, imagem) pra
  preview bom quando o link for compartilhado no Instagram/WhatsApp
- Sempre incluir UTM no link de CTA quando a campanha tiver origem
  definida (ex: ?utm_source=instagram&utm_campaign=pericia-r1)

## Formulário de captação integrado ao CRM

Toda isca com formulário usa o módulo de páginas externas do CRM DQ.

### Fluxo (designer + Claude Code)
1. A designer cadastra a página na tela do CRM: **Páginas / UTMs →
   aba "Captação Externa"** (slug, tag UnniChat, destino pós-submit,
   campanha opcional e textos: titulo, subtitulo, texto_botao,
   url_download_isca, texto_obrigado).
2. Ela pede o layout informando o **slug**. O slug do `data-slug` do
   formulário É o nome da pasta da isca (`/iscas/<slug>/index.html`).
3. O formulário entra via snippet canônico em
   `/templates/formulario.html` (classe `dq-lead-form` + `data-slug` +
   campos `nome`/`whatsapp`/`email`) + o script fixo
   `/assets/js/lead-capture.js` antes do `</body>`.

### Como funciona (não mexer sem necessidade)
- `lead-capture.js` carrega os textos do CRM no load (elementos com
  `data-dq-text="chave"` — o conteúdo estático é só fallback) e, no
  submit, envia o lead + UTMs da URL pro CRM, que responde o redirect
  (WhatsApp, grupo ou `/obrigado/?slug=...`).
- `/obrigado/index.html` é genérica: lê `?slug=`, busca a config e
  mostra `texto_obrigado` + botão de download (`url_download_isca`).
- **A tag do UnniChat NÃO existe mais no HTML** — é aplicada pelo
  servidor no submit. Nunca colocar tag/segredo no repo.
- Editar textos/destino/tag = tela do CRM, sem tocar no HTML.
- Página de teste de referência: `/iscas/teste-captacao/`.
