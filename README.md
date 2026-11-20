# Brasa Burger — MenuZap (MVP)

Menu digital responsivo com carrinho e finalização via WhatsApp. HTML + CSS + JavaScript puro, sem build e sem backend.

## Como executar

- Abrir `index.html` direto no navegador, **ou**
- Servir a pasta: `python3 -m http.server 8000` e acessar http://localhost:8000
- Deploy: arrastar a pasta para Netlify ou Vercel (hospedagem estática).

## Onde editar

| O quê | Arquivo |
|---|---|
| Número do WhatsApp (DDI+DDD+número, só dígitos) | `js/config.js` → `store.whatsapp` |
| Nome, endereço, horário, tempo de preparo | `js/config.js` → `store` |
| "Aberto agora" (fixo ou automático por horário) | `js/config.js` → `hours.statusMode` |
| Taxa de entrega, limite por item | `js/config.js` → `order` |
| Categorias | `js/config.js` → `categories` |
| Produtos, preços, fotos, selos, indisponibilidade | `js/products.js` |
| Cores e tipografia | `css/style.css` (variáveis em `:root`) |

Imagens: use URLs do Unsplash ou coloque arquivos em `assets/images/` e aponte `image: 'assets/images/arquivo.jpg'`.
Para marcar um item como indisponível, adicione `available: false` ao produto.
