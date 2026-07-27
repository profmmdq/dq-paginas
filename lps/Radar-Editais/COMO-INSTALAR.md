# Radar de Editais IF · Como instalar (10 minutos)

O sistema tem 3 peças: uma **Planilha Google** (memória), um **Apps Script** (o robô que varre as fontes de hora em hora, 24h por dia, mesmo com tudo fechado) e o **painel HTML** (o que vocês abrem para ver tudo). É o mesmo esquema do quiz da Perícia, então o caminho já é conhecido.

---

## Passo 1 · Criar a planilha

1. No Google Drive, crie uma **Planilha Google** nova. Nome sugerido: "Radar de Editais IF".
2. Não precisa criar aba nem cabeçalho: o robô cria tudo sozinho no Passo 2.

## Passo 2 · Instalar o robô

1. Com a planilha aberta: **Extensões → Apps Script**.
2. Apague o que estiver lá e cole o conteúdo inteiro do arquivo **CODIGO-APPS-SCRIPT.txt** (está nesta pasta).
3. Salve (disquete).
4. No topo, escolha a função **setup** e clique em **Executar**. O Google vai pedir autorização (é seu próprio script, pode permitir; se aparecer o aviso de "app não verificado", clique em Avançado → Acessar).
5. Pronto. O setup cria as abas **Fontes** (as 49 fontes já preenchidas), **Achados** e **Log**, cria o **gatilho de 1 em 1 hora** e já faz a primeira varredura na hora.

## Passo 3 · Publicar a API do painel

1. **Implantar → Nova implantação → App da Web**.
2. Executar como: **Eu**. Quem pode acessar: **Qualquer pessoa**.
3. **Implantar** e copie a URL que termina em **/exec**.

## Passo 4 · Conectar o painel

1. Abra o **index.html** desta pasta em um editor.
2. Perto do fim, cole a URL na linha: `var ENDPOINT = "COLE_AQUI";`
3. Salve. Pode abrir o index.html direto no navegador ou subir junto com as outras páginas do site (fica bom em `/radar/`).

---

## Como usar no dia a dia

- O robô roda sozinho de hora em hora. O painel, aberto, se atualiza a cada 5 minutos.
- **Achados** com etiqueta laranja **NOVO** são links que o radar nunca tinha visto. Depois de revisar, clique em **"Marcar tudo como visto"**: o que chegar depois disso volta a se destacar.
- **Fontes monitoradas**: verde = coletando; vermelho = erro (a coluna "Último erro" na planilha diz o motivo, quase sempre URL que mudou); cinza = nunca coletou.

## Primeira semana: calibragem

1. **Primeira varredura é barulhenta.** O radar vai listar tudo o que já existe nas páginas (editais antigos inclusive). É normal: revise por alto e clique em "Marcar tudo como visto". Do segundo ciclo em diante, só aparece o que for realmente novidade.
2. **Fontes marcadas com "conferir URL"**: eu preenchi as 49 fontes com as páginas oficiais que localizei, mas alguns IFs mudam de portal com frequência. Se uma fonte ficar vermelha ou trouxer pouca coisa, troque a URL dela na aba **Fontes** da planilha (basta editar a célula, sem mexer em código). O ideal é apontar para a página "Concursos" ou "Editais" de cada IF, que é mais limpa que a home.
3. **Ligar e desligar fonte**: coluna "Ativa" (SIM/NAO) na planilha.
4. **Ajustar o que o radar considera relevante**: a lista de palavras está na primeira linha do código (`KEYWORDS`). Hoje: edital, concurso, EBTT, TAE, docente, professor efetivo/substituto, homologação, retificação, inscrição, magistério, técnico-administrativo.

## Limites e observações

- Tudo roda no plano normal do Google, sem custo. A cota de leituras de página é de 20 mil por dia; o radar usa cerca de 1.200.
- Se um dia quiserem alerta ativo (e-mail ou Telegram quando surgir achado novo), o código já está pronto para receber isso: é acrescentar poucas linhas na função `varrer`. É só me pedir.
- Se mudar o código depois, lembre: **Implantar → Gerenciar implantações → editar → Nova versão**, senão o Google continua servindo a versão antiga para o painel.
