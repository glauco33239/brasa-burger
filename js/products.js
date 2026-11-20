/**
 * Brasa Burger — cardápio
 *
 * Campos:
 *  id          identificador único (texto, sem espaços)
 *  category    deve existir em APP_CONFIG.categories
 *  name        nome do produto
 *  description descrição exibida no card e na modal
 *  price       preço em reais (número)
 *  image       URL da imagem (Unsplash ou caminho local, ex.: 'assets/images/classic.jpg')
 *  badge       (opcional) selo de destaque, ex.: 'Mais vendido'
 *  available   (opcional) use false para marcar como indisponível
 */
const PRODUCTS = [
  // ---------- Hambúrgueres ----------
  {
    id: 'brasa-classic',
    category: 'hamburgueres',
    name: 'Brasa Classic',
    description: 'Pão brioche, burger 180g, queijo cheddar, alface, tomate e molho especial.',
    price: 29.9,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
  },
  {
    id: 'bacon-supreme',
    category: 'hamburgueres',
    name: 'Bacon Supreme',
    description: 'Burger 180g, cheddar, bacon crocante, cebola caramelizada e molho da casa.',
    price: 34.9,
    badge: 'Mais vendido',
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b',
  },
  {
    id: 'double-brasa',
    category: 'hamburgueres',
    name: 'Double Brasa',
    description: 'Dois burgers de 120g, cheddar duplo e molho especial.',
    price: 39.9,
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9',
  },
  {
    id: 'chicken-crispy',
    category: 'hamburgueres',
    name: 'Chicken Crispy',
    description: 'Frango crocante, queijo, alface e maionese artesanal.',
    price: 27.9,
    image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086',
  },

  // ---------- Combos ----------
  {
    id: 'combo-classic',
    category: 'combos',
    name: 'Combo Classic',
    description: 'Brasa Classic, batata frita e refrigerante.',
    price: 42.9,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
  },
  {
    id: 'combo-bacon',
    category: 'combos',
    name: 'Combo Bacon',
    description: 'Bacon Supreme, batata frita e refrigerante.',
    price: 47.9,
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5',
  },

  // ---------- Acompanhamentos ----------
  {
    id: 'batata-frita',
    category: 'acompanhamentos',
    name: 'Batata Frita',
    description: 'Batatas crocantes com sal especial.',
    price: 14.9,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877',
  },
  {
    id: 'onion-rings',
    category: 'acompanhamentos',
    name: 'Onion Rings',
    description: 'Anéis de cebola empanados e crocantes.',
    price: 16.9,
    image: 'https://images.unsplash.com/photo-1639024471283-03518883512d',
  },

  // ---------- Bebidas ----------
  {
    id: 'coca-cola-lata',
    category: 'bebidas',
    name: 'Coca-Cola Lata',
    description: 'Refrigerante 350ml.',
    price: 6.0,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97',
  },
  {
    id: 'guarana-lata',
    category: 'bebidas',
    name: 'Guaraná Lata',
    description: 'Refrigerante 350ml.',
    price: 6.0,
    image: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a',
  },
  {
    id: 'milkshake-chocolate',
    category: 'bebidas',
    name: 'Milkshake de Chocolate',
    description: 'Milkshake cremoso de chocolate 400ml.',
    price: 18.9,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699',
  },

  // ---------- Sobremesas ----------
  {
    id: 'brownie',
    category: 'sobremesas',
    name: 'Brownie',
    description: 'Brownie de chocolate com cobertura.',
    price: 12.0,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c',
  },
];
