ml/**
 * Brasa Burger — configurações gerais
 * Edite este arquivo para personalizar o menu para outro estabelecimento.
 */
const APP_CONFIG = {
  // ---------- Dados da loja ----------
  store: {
    name: 'Brasa Burger',
    // Somente números, com DDI + DDD (ex.: 5522999999999). Número fictício de desenvolvimento.
    whatsapp: '5522999999999',
    address: 'Rua das Palmeiras, 120 — Centro',
    hoursLabel: 'Terça a domingo, 18h às 23h',
    prepTime: '30–45 min',
    fulfillment: 'Entrega e retirada',
  },

  // ---------- Funcionamento ----------
  hours: {
    // 'open'   -> sempre mostra "Aberto agora" (ideal para demonstração)
    // 'closed' -> sempre mostra "Fechado agora"
    // 'auto'   -> calcula com base nos dias e horários abaixo
    statusMode: 'open',
    openDays: [2, 3, 4, 5, 6, 0], // 0 = domingo ... 6 = sábado
    opensAt: '18:00',
    closesAt: '23:00',
  },

  // ---------- Pedido ----------
  order: {
    deliveryFee: 5, // em reais; use 0 para entrega grátis
    maxQtyPerItem: 20,
    noteMaxLength: 140,
    locale: 'pt-BR',
    currency: 'BRL',
  },

  // Prefixo das chaves usadas no LocalStorage
  storageKey: 'brasa-burger',

  // ---------- Categorias (a ordem define a navegação) ----------
  categories: [
    { id: 'all', label: 'Todos', emoji: '🍽️' },
    { id: 'hamburgueres', label: 'Hambúrgueres', emoji: '🍔' },
    { id: 'combos', label: 'Combos', emoji: '🥡' },
    { id: 'acompanhamentos', label: 'Acompanhamentos', emoji: '🍟' },
    { id: 'bebidas', label: 'Bebidas', emoji: '🥤' },
    { id: 'sobremesas', label: 'Sobremesas', emoji: '🍫' },
  ],

  // ---------- Imagens ----------
  images: {
    hero: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add',
    // Exibida automaticamente quando uma imagem não carrega.
    fallback:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">' +
          '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="#F0ECE6"/><stop offset="1" stop-color="#E8E2DA"/></linearGradient></defs>' +
          '<rect width="800" height="600" fill="url(#g)"/>' +
          '<g transform="translate(400 290)" opacity=".85">' +
          '<path d="M-110 -10a110 85 0 0 1 220 0z" fill="#D95D39"/>' +
          '<rect x="-120" y="0" width="240" height="18" rx="9" fill="#38865B"/>' +
          '<rect x="-115" y="22" width="230" height="26" rx="13" fill="#B94325"/>' +
          '<path d="M-110 52h220a0 0 0 0 1 0 0 55 40 0 0 1-55 40h-110a55 40 0 0 1-55-40z" fill="#D95D39"/>' +
          '</g>' +
          '<text x="400" y="480" text-anchor="middle" font-family="sans-serif" font-size="26" fill="#77716B">Imagem indisponível</text>' +
          '</svg>'
      ),
  },
};
