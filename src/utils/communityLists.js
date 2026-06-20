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
  }
];
