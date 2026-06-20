export const COMMUNITY_CATEGORIES = ['Todas', 'Recetas', 'Viajes', 'Hogar', 'Eventos'];

export const COMMUNITY_LISTS = [
  {
    id: 'c1', name: 'Sushi Casero para 4', emoji: '🍣', category: 'Recetas',
    description: 'Todo lo necesario para una noche de sushi.', author: '@cocinero_feliz',
    items: [
      { id: 'i1', name: 'Arroz para sushi', quantity: '500', unit: 'gramos' },
      { id: 'i2', name: 'Algas Nori', quantity: '1', unit: 'paquete' },
      { id: 'i3', name: 'Salmón fresco', quantity: '400', unit: 'gramos' },
      { id: 'i4', name: 'Queso crema', quantity: '1', unit: 'paquete' },
      { id: 'i5', name: 'Salsa de Soya', quantity: '1', unit: 'botella' }
    ]
  },
  {
    id: 'c2', name: 'Trekking fin de semana', emoji: '🏔️', category: 'Viajes',
    description: 'Kit de supervivencia y snacks para la montaña.', author: '@ruta_salvaje',
    items: [
      { id: 'i1', name: 'Botella de agua', quantity: '2', unit: 'litros' },
      { id: 'i2', name: 'Barras de cereal', quantity: '4', unit: 'unidades' },
      { id: 'i3', name: 'Bloqueador solar', quantity: '1', unit: 'unidad' },
      { id: 'i4', name: 'Frutos secos', quantity: '1', unit: 'bolsa' }
    ]
  },
  {
    id: 'c3', name: 'Limpieza Profunda', emoji: '🧹', category: 'Hogar',
    description: 'Básicos para dejar la casa impecable.', author: '@home_sync',
    items: [
      { id: 'i1', name: 'Cloro', quantity: '1', unit: 'litro' },
      { id: 'i2', name: 'Limpiavidrios', quantity: '1', unit: 'botella' },
      { id: 'i3', name: 'Esponjas', quantity: '1', unit: 'paquete' }
    ]
  },
  {
    id: 'c4', name: 'Asado familiar (8 personas)', emoji: '🥩', category: 'Eventos',
    description: 'Cantidades perfectas para un asado el domingo.', author: '@parrillero_master',
    items: [
      { id: 'i1', name: 'Carne (Lomo Vetado)', quantity: '2', unit: 'kilogramos' },
      { id: 'i2', name: 'Chorizos', quantity: '8', unit: 'unidades' },
      { id: 'i3', name: 'Carbón', quantity: '1', unit: 'bolsa' },
      { id: 'i4', name: 'Pan marraqueta', quantity: '1', unit: 'kilogramo' },
      { id: 'i5', name: 'Tomate', quantity: '1', unit: 'kilogramo' }
    ]
  },
  {
    id: 'c5', name: 'Torta de Cumpleaños fácil', emoji: '🎂', category: 'Recetas',
    description: 'Ingredientes para un bizcocho de chocolate relleno.', author: '@dulce_secreto',
    items: [
      { id: 'i1', name: 'Harina sin polvos', quantity: '500', unit: 'gramos' },
      { id: 'i2', name: 'Cacao amargo', quantity: '100', unit: 'gramos' },
      { id: 'i3', name: 'Huevos', quantity: '6', unit: 'unidades' },
      { id: 'i4', name: 'Manjar', quantity: '1', unit: 'kilogramo' },
      { id: 'i5', name: 'Crema para batir', quantity: '500', unit: 'mililitros' }
    ]
  },
  {
    id: 'c6', name: 'Despensa Mensual Básica', emoji: '🥫', category: 'Hogar',
    description: 'Lo que no puede faltar para arrancar el mes.', author: '@ahorro_familiar',
    items: [
      { id: 'i1', name: 'Arroz', quantity: '3', unit: 'kilogramos' },
      { id: 'i2', name: 'Fideos', quantity: '4', unit: 'paquetes' },
      { id: 'i3', name: 'Aceite', quantity: '2', unit: 'litros' },
      { id: 'i4', name: 'Sal', quantity: '1', unit: 'paquete' },
      { id: 'i5', name: 'Papel higiénico', quantity: '2', unit: 'paquetes' }
    ]
  },
  {
    id: 'c7', name: 'Noche de Pizzas', emoji: '🍕', category: 'Recetas',
    description: 'Haz tus propias pizzas artesanales.', author: '@pizza_lover',
    items: [
      { id: 'i1', name: 'Harina', quantity: '1', unit: 'kilogramo' },
      { id: 'i2', name: 'Levadura', quantity: '1', unit: 'sobre' },
      { id: 'i3', name: 'Salsa de tomate', quantity: '2', unit: 'paquetes' },
      { id: 'i4', name: 'Queso mozzarella', quantity: '500', unit: 'gramos' },
      { id: 'i5', name: 'Pepperoni', quantity: '1', unit: 'paquete' }
    ]
  },
  {
    id: 'c8', name: 'Viaje a la Playa', emoji: '🏖️', category: 'Viajes',
    description: 'Kit para un día bajo el sol.', author: '@verano_eterno',
    items: [
      { id: 'i1', name: 'Bloqueador solar', quantity: '1', unit: 'unidad' },
      { id: 'i2', name: 'Agua mineral', quantity: '3', unit: 'litros' },
      { id: 'i3', name: 'Snacks salados', quantity: '2', unit: 'bolsas' },
      { id: 'i4', name: 'Bolsas de basura', quantity: '1', unit: 'paquete' }
    ]
  },
  {
    id: 'c9', name: 'Cumpleaños Infantil', emoji: '🎈', category: 'Eventos',
    description: 'Todo para la fiesta de los niños.', author: '@fiesta_total',
    items: [
      { id: 'i1', name: 'Vasos desechables', quantity: '2', unit: 'paquetes' },
      { id: 'i2', name: 'Platos de cartón', quantity: '2', unit: 'paquetes' },
      { id: 'i3', name: 'Bebidas surtidas', quantity: '4', unit: 'litros' },
      { id: 'i4', name: 'Papas fritas', quantity: '3', unit: 'bolsas' },
      { id: 'i5', name: 'Galletas surtidas', quantity: '4', unit: 'paquetes' }
    ]
  },
  {
    id: 'c10', name: 'Botiquín de Emergencia', emoji: '🩹', category: 'Hogar',
    description: 'Artículos médicos esenciales para el hogar.', author: '@primeros_auxilios',
    items: [
      { id: 'i1', name: 'Paracetamol', quantity: '1', unit: 'caja' },
      { id: 'i2', name: 'Parches curita', quantity: '1', unit: 'caja' },
      { id: 'i3', name: 'Alcohol', quantity: '1', unit: 'botella' },
      { id: 'i4', name: 'Algodón', quantity: '1', unit: 'bolsa' }
    ]
  },
  {
    id: 'c11', name: 'Desayuno de Campeones', emoji: '🥞', category: 'Recetas',
    description: 'Pancakes, huevos y tocino para el finde.', author: '@morning_chef',
    items: [
      { id: 'i1', name: 'Huevos', quantity: '6', unit: 'unidades' },
      { id: 'i2', name: 'Harina', quantity: '500', unit: 'gramos' },
      { id: 'i3', name: 'Leche', quantity: '1', unit: 'litro' },
      { id: 'i4', name: 'Tocino', quantity: '1', unit: 'paquete' },
      { id: 'i5', name: 'Miel o syrup', quantity: '1', unit: 'botella' }
    ]
  },
  {
    id: 'c12', name: 'Camping 3 días', emoji: '⛺', category: 'Viajes',
    description: 'Comida no perecible para la aventura.', author: '@mochilero_pro',
    items: [
      { id: 'i1', name: 'Atún en lata', quantity: '4', unit: 'latas' },
      { id: 'i2', name: 'Fideos instantáneos', quantity: '6', unit: 'paquetes' },
      { id: 'i3', name: 'Café instantáneo', quantity: '1', unit: 'frasco' },
      { id: 'i4', name: 'Galletas de agua', quantity: '3', unit: 'paquetes' }
    ]
  },
  {
    id: 'c13', name: 'Aseo Personal Mensual', emoji: '🧼', category: 'Hogar',
    description: 'Reposición de artículos de baño.', author: '@cuidado_diario',
    items: [
      { id: 'i1', name: 'Pasta de dientes', quantity: '2', unit: 'unidades' },
      { id: 'i2', name: 'Jabón en barra', quantity: '3', unit: 'unidades' },
      { id: 'i3', name: 'Champú', quantity: '1', unit: 'botella' },
      { id: 'i4', name: 'Desodorante', quantity: '2', unit: 'unidades' }
    ]
  }
];
