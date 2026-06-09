Projeto Prisma - 29 de maio (Gabriel): Adicionei Login, Cadastro, Perfil, Database, Conteudos e Comentários.
O XAMPP MySQL com PHP MyAdmin está conectado no meu PC localmente. 
O JS no seu PC vai funcionar normalmente, mas sem guardar informações de dados do usuário.

01 de Junho (Gabriel): PHP do Backend Completo: database, fórum, login,logout, materiais, perfil e index. app.js 100% conectado aos arquivos PHP. 

Projeto Prisma - 06 de junho (Camila): Separei o JS feitos no app.js e adicionei algumas coisas no cadastro e login.
As páginas do cadastro e e login estão prontas, apenas certificar se o código está funcionando corretamente.
A página principal está parcialmente completa, falta o conteúdo para finalizar o front-end e back-end.
As páginas sem js terão sua base feita sem front-end pronto e outros.
Forum parcialmente pronto, falta conteúdo para testar e finalizar (o front-end está quase pronto para ter noção sobre os código no front-end).
Perfil já está sendo feito.

07 de junho (Camila): Forum e Perfil parcialmentes completos, conteudo necessario para testes e finalização de front-end e back-end.
Talvez precise de uma função para identificar a aula (curso, vestibular ou ensino médio) e uma para reconhecer postagem recentes para por em destaque para conseguir testar o index.


09 de junho: Atualização de funcionalidades do professor e materiais.
- perfil.html e js/perfil.js: carregamento do perfil com resumo automático, foto, nome, email e botão de editar funcionando.
- postagem_prof.html e js/postagem_prof.js: fluxo de criação de conteúdo concluído e agora gera resumos após salvar.
- material_prof.html e js/material_prof.js: listagem de conteúdos do professor com cards expandidos, exclusão de conteúdo com confirmação inline e controle de materiais.
- api/model/materiais.php: suporte a upload de arquivos (multipart/form-data), gravação em api/img/materiais/, validação de tipos e tamanho, e manutenção do fluxo de materiais por URL.
- css/style.css: estilos novos para visualização de imagem em overlay.
- material_prof.html: painel de visualização de imagem adicionado, permitindo abrir preview customizado sem sair da página.
