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
