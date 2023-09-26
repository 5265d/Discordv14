# EnigmaVerse

Este é um bot para Discord desenvolvido em JavaScript usando a biblioteca Discord.js. O bot tem funcionalidades para interagir com membros do servidor e realizar ações como banir, desbanir e limpar logs.

## Configuração

1. **Clone o Repositório:**

   ```shell
   git clone https://github.com/5265d/EnigmaVerse.git
   ```

2. **Instale as Dependências:**

   ```shell
   cd seu-repositorio
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**

   Crie um arquivo `.env` na raiz do projeto e configure as seguintes variáveis:

   ```env
   token=SEU_TOKEN_DO_DISCORD
   ```

   Certifique-se de que o seu bot está registrado no [Portal de Desenvolvedores do Discord](https://discord.com/developers/applications) e você tenha um token válido.

4. **Estrutura de Diretórios:**

   Certifique-se de que o seu projeto tem a seguinte estrutura de diretórios:

   ```
   ├── commands/
   │   ├── command1.js
   │   ├── command2.js
   │   └── ...
   ├── logs/
   │   ├── banned-users.txt
   │   └── message-log.txt
   ├── .env
   ├── index.js
   └── README.md
   ```

## Uso

- Execute o bot:

  ```shell
  node index.js
  ```

- Para interagir com o bot, você pode usar comandos no chat do servidor ou executar comandos via terminal interativo (comando `/`) quando estiver em execução.

## Comandos

- `/ban <userId> [bannedDays]`: Banir um usuário do servidor.

- `/unban <userId>`: Desbanir um usuário do servidor.

- `/limparlogs`: Limpar o registro de comandos.

- `/exit`: Encerrar o bot.

## Registro de Comandos

Todas as mensagens enviadas no servidor são registradas em um arquivo de log `message-log.txt` na pasta `logs`.

## Contribuindo

Se deseja contribuir para este projeto, siga os passos:

1. Faça um fork do projeto.
2. Crie uma branch para sua contribuição: `git checkout -b minha-contribuicao`.
3. Faça as mudanças necessárias e faça o commit: `git commit -m "Minha Contribuição"`.
4. Envie as mudanças para o seu fork: `git push origin minha-contribuicao`.
5. Crie um Pull Request no repositório original.

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.

---

Espero que esta documentação básica ajude você a começar com o seu bot Discord.js! Sinta-se à vontade para personalizar e adicionar mais informações conforme necessário.
```

Certifique-se de substituir `<SEU_TOKEN_DO_DISCORD>` pelo token do seu bot e personalizar o arquivo README com informações específicas do seu projeto, como descrição, instruções de configuração e uso, comandos disponíveis e detalhes de como os outros podem contribuir para o seu projeto.
