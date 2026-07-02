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

### Fluxo (designer + Claude Code) — 4 passos
1. **Criar a automação no UnniChat**: duplicar a automação-modelo de LP
   e configurar a tag da página no bloco **"Listagem de tags"** (a tag
   vive DENTRO da automação, não no site nem no CRM).
2. **Copiar o link de acionamento** da automação (ex.:
   `https://unnichat.com.br/a/start/...`).
3. **Cadastrar a página na tela do CRM**: Páginas / UTMs → aba
   "Captação Externa" (slug, **colar o link de acionamento**, destino
   pós-submit, campanha opcional e textos: titulo, subtitulo,
   texto_botao, url_download_isca, texto_obrigado). O campo "Tag
   UnniChat" ali é só registro/documentação.
4. **Pedir o layout ao Claude Code informando o slug**. O slug do
   `data-slug` do formulário É o nome da pasta da isca
   (`/iscas/<slug>/index.html`). O formulário entra via snippet
   canônico em `/templates/formulario.html` (classe `dq-lead-form` +
   `data-slug` + campos `nome`/`whatsapp`/`email`) + o script fixo
   `/assets/js/lead-capture.js` antes do `</body>`.

### Como funciona (não mexer sem necessidade)
- `lead-capture.js` carrega os textos do CRM no load (elementos com
  `data-dq-text="chave"` — o conteúdo estático é só fallback) e, no
  submit, envia o lead + UTMs da URL pro CRM, que responde o redirect
  (WhatsApp, grupo ou `/obrigado/?slug=...`).
- `/obrigado/index.html` é genérica: lê `?slug=`, busca a config e
  mostra `texto_obrigado` + botão de download (`url_download_isca`).
- **A tag do UnniChat NÃO existe no HTML nem no payload** — o CRM faz
  POST no link de acionamento da automação e a tag é aplicada dentro
  dela. Nunca colocar tag, link de acionamento ou segredo no repo.
- Editar textos/destino/tag = tela do CRM, sem tocar no HTML.
- Página de teste de referência: `/iscas/teste-captacao/`.
