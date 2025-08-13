# Configuração de Variáveis de Ambiente

## 📋 Overview

Este projeto utiliza variáveis de ambiente para armazenar informações sensíveis como chaves de API e credenciais de desenvolvimento de forma segura.

## 🔧 Configuração

### 1. Arquivo `.env`

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

### 2. Configurar as Variáveis

Edite o arquivo `.env` com suas próprias configurações:

```env
# Configurações de API
REACT_APP_GOOGLE_GEMINI_API_KEY=sua_chave_api_do_google_gemini

# Configurações de Autenticação (para desenvolvimento)
REACT_APP_ADMIN_USERNAME=admin
REACT_APP_ADMIN_PASSWORD=sua_senha_admin
REACT_APP_SUPER_USERNAME=supervisor
REACT_APP_SUPER_PASSWORD=sua_senha_supervisor
REACT_APP_GUEST_USERNAME=guest
REACT_APP_GUEST_PASSWORD=sua_senha_guest

# Configurações da Aplicação
REACT_APP_DASHBOARD_TOKEN_PREFIX=dashboard_token
```

## 🔑 Variáveis Disponíveis

### Chaves de API

| Variável                          | Descrição                                        | Obrigatório |
| --------------------------------- | ------------------------------------------------ | ----------- |
| `REACT_APP_GOOGLE_GEMINI_API_KEY` | Chave da API do Google Gemini para análise de IA | Não\*       |

\*A aplicação funciona sem a chave, usando análise local

### Credenciais de Desenvolvimento

| Variável                   | Descrição                        | Padrão       |
| -------------------------- | -------------------------------- | ------------ |
| `REACT_APP_ADMIN_USERNAME` | Nome de usuário do administrador | `admin`      |
| `REACT_APP_ADMIN_PASSWORD` | Senha do administrador           | `admin123`   |
| `REACT_APP_SUPER_USERNAME` | Nome de usuário do supervisor    | `supervisor` |
| `REACT_APP_SUPER_PASSWORD` | Senha do supervisor              | `super123`   |
| `REACT_APP_GUEST_USERNAME` | Nome de usuário do visitante     | `guest`      |
| `REACT_APP_GUEST_PASSWORD` | Senha do visitante               | `guest123`   |

### Configurações da Aplicação

| Variável                           | Descrição                           | Padrão            |
| ---------------------------------- | ----------------------------------- | ----------------- |
| `REACT_APP_DASHBOARD_TOKEN_PREFIX` | Prefixo para tokens no localStorage | `dashboard_token` |

## 🔒 Segurança

### ⚠️ Importantes

1. **NUNCA** commite o arquivo `.env` no Git
2. O arquivo `.gitignore` já está configurado para ignorar arquivos `.env`
3. Use sempre o prefixo `REACT_APP_` para variáveis React
4. Em produção, configure as variáveis no ambiente do servidor

### 🎯 Boas Práticas

- ✅ Use senhas fortes em produção
- ✅ Rotacione chaves de API regularmente
- ✅ Use ambientes separados (dev/staging/prod)
- ❌ Não compartilhe arquivos `.env`
- ❌ Não use credenciais reais em desenvolvimento

## 🚀 Como Obter a Chave do Google Gemini

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada
5. Adicione no arquivo `.env`:
   ```env
   REACT_APP_GOOGLE_GEMINI_API_KEY=sua_chave_aqui
   ```

## 🔄 Restart do Servidor

Após modificar o arquivo `.env`, reinicie o servidor de desenvolvimento:

```bash
npm start
```

## 🐛 Troubleshooting

### Problema: Variáveis não são carregadas

- **Solução**: Certifique-se de usar o prefixo `REACT_APP_`
- **Solução**: Reinicie o servidor após modificar `.env`

### Problema: API do Gemini não funciona

- **Solução**: Verifique se a chave está correta
- **Solução**: A aplicação funcionará com análise local se não houver chave

### Problema: Login não funciona

- **Solução**: Verifique se as credenciais no `.env` estão corretas
- **Solução**: Use as credenciais padrão se não houver arquivo `.env`
