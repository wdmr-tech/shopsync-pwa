export const COMMON_PRODUCTS = [
  // Frutas y Verduras
  'Manzana', 'Plátano', 'Limón', 'Naranja', 'Tomate', 'Cebolla', 'Ajo', 'Papa', 'Zanahoria', 'Lechuga', 'Palta', 'Pera', 'Uva', 'Sandía', 'Melón', 'Durazno', 'Frutilla', 'Arándanos', 'Espinaca', 'Brócoli', 'Coliflor', 'Zapallo', 'Champiñones', 'Pimentón', 'Ají', 'Cilantro', 'Perejil', 'Apio', 'Pepino',
  
  // Lácteos y Huevos
  'Leche', 'Leche sin lactosa', 'Huevos', 'Queso', 'Queso crema', 'Queso rallado', 'Mantequilla', 'Margarina', 'Yogur', 'Crema de leche', 'Manjar',
  
  // Despensa y Abarrotes
  'Arroz', 'Fideos', 'Espaguetis', 'Macarrones', 'Aceite', 'Aceite de oliva', 'Sal', 'Azúcar', 'Harina', 'Harina sin polvos', 'Pan', 'Pan de molde', 'Café', 'Té', 'Avena', 'Galletas', 'Galletas saladas', 'Salsa de tomate', 'Atún', 'Jurel', 'Mayonesa', 'Ketchup', 'Mostaza', 'Vinagre', 'Lentejas', 'Porotos', 'Garbanzos', 'Cereal', 'Mermelada', 'Miel', 'Sopa en sobre',
  
  // Carnes y Fiambres
  'Pollo', 'Pechuga de pollo', 'Carne', 'Carne molida', 'Cerdo', 'Pescado', 'Salchichas', 'Vienesas', 'Jamón', 'Mortadela', 'Salame', 'Pavo', 'Hamburguesas', 'Chorizo',
  
  // Limpieza del Hogar
  'Papel higiénico', 'Detergente', 'Suavizante', 'Lavalozas', 'Cloro', 'Toallas de papel', 'Limpiavidrios', 'Desinfectante', 'Bolsas de basura', 'Esponja', 'Mopa',
  
  // Aseo Personal
  'Jabón', 'Pasta de dientes', 'Champú', 'Acondicionador', 'Desodorante', 'Cepillo de dientes', 'Crema corporal', 'Toallas higiénicas', 'Máquina de afeitar', 'Algodón',
  
  // Bebidas y Snacks
  'Agua', 'Agua con gas', 'Bebida', 'Jugo', 'Cerveza', 'Vino', 'Papas fritas', 'Ramitas', 'Mani', 'Chocolates', 'Helado',
  
  // Otros / Mascotas
  'Comida para perro', 'Comida para gato', 'Arena para gato', 'Pilas', 'Fósforos', 'Ampolletas'
];

const CATEGORY_KEYWORDS = {
  'Frutas y Verduras': ['manzana', 'platano', 'plátano', 'limon', 'limón', 'naranja', 'tomate', 'cebolla', 'ajo', 'papa', 'zanahoria', 'lechuga', 'palta', 'pera', 'uva', 'sandia', 'melon', 'durazno', 'frutilla', 'arandano', 'espinaca', 'brocoli', 'coliflor', 'zapallo', 'champiñon', 'pimenton', 'aji', 'cilantro', 'perejil', 'apio', 'pepino', 'verdura', 'fruta', 'limones'],
  'Lácteos y Huevos': ['leche', 'huevo', 'queso', 'mantequilla', 'margarina', 'yogur', 'crema', 'manjar', 'lacteo'],
  'Despensa': ['arroz', 'fideo', 'pasta', 'tallarin', 'espiral', 'aceite', 'sal', 'azucar', 'azúcar', 'harina', 'cafe', 'café', 'te', 'té', 'avena', 'galleta', 'salsa', 'ketchup', 'mayonesa', 'mostaza', 'atun', 'jurel', 'conserva', 'lenteja', 'poroto', 'garbanzo', 'cereal', 'mermelada', 'miel', 'sopa', 'caldo', 'pure', 'levadura', 'aliño', 'oregano', 'pimienta', 'comino', 'vinagre', 'aceto', 'legumbre', 'frijol', 'tallarines', 'fideos'],
  'Panadería y Pastelería': ['pan', 'marraqueta', 'hallulla', 'baguette', 'molde', 'torta', 'pastel', 'empanada', 'croissant', 'queque'],
  'Carnes y Fiambres': ['pollo', 'carne', 'vacuno', 'cerdo', 'pescado', 'salchicha', 'vienesa', 'jamon', 'jamón', 'mortadela', 'salame', 'pavo', 'hamburguesa', 'chorizo', 'longaniza', 'cecina', 'tocino', 'marisco', 'camaron', 'salmón', 'salmon', 'vienesas'],
  'Limpieza y Aseo': ['papel higienico', 'papel', 'detergente', 'suavizante', 'lavaloza', 'cloro', 'jabon', 'jabón', 'pasta', 'diente', 'champu', 'shampoo', 'acondicionador', 'desodorante', 'cepillo', 'crema', 'toalla', 'maquina', 'algodon', 'limpiador', 'desinfectante', 'basura', 'esponja', 'mopa', 'pañal', 'toallita'],
  'Bebidas y Snacks': ['agua', 'bebida', 'jugo', 'cerveza', 'vino', 'licor', 'pisco', 'ron', 'papa frita', 'ramita', 'mani', 'chocolate', 'helado', 'snack', 'dorito', 'alcohol', 'bebidas'],
  'Congelados': ['hielo', 'sofrito', 'congelado', 'pizza']
};

export const getCategoryForProduct = (productName) => {
  if (!productName) return 'Otros';
  // Normalizamos quitando acentos básicos y pasando a minúsculas
  const normalized = productName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    // Normalizamos también las keywords por seguridad
    const normalizedKeywords = keywords.map(kw => kw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    
    // Verificamos si alguna palabra clave está INCLUIDA en el nombre del producto
    if (normalizedKeywords.some(keyword => normalized.includes(keyword))) {
      return category;
    }
  }
  
  return 'Otros';
};

export const formatQuantityText = (quantity, unit) => {
  if (!quantity) return '';
  if (!unit || unit === 'unidades' || unit === 'otro') return String(quantity);

  const num = parseFloat(quantity);
  if (isNaN(num)) return `${quantity} ${unit}`; // Por si escriben "media"

  // Si es 1, retornamos el singular
  if (num === 1) return `1 ${unit}`;

  // Lógica simple de plurales
  let pluralUnit = unit;
  if (unit.endsWith('z')) {
    pluralUnit = unit.slice(0, -1) + 'ces'; // ej: 2 nueces (poco probable, pero seguro)
  } else if (unit.endsWith('n') || unit.endsWith('r') || unit.endsWith('l')) {
    pluralUnit = unit + 'es'; // ej: 2 litros, 2 cartones
  } else if (!unit.endsWith('s')) {
    pluralUnit = unit + 's'; // ej: 2 bolsas, 2 paquetes, 2 cajas
  }

  return `${num} ${pluralUnit}`;
};

export const formatListDate = (dateString) => {
  if (!dateString) return null;
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Mes en JS es 0-11
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(date);
  }
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(date);
};

export const getListStatus = (list) => {
  if (!list || !list.items) return 'pendiente'; // Retorno seguro

  // 1. Respetar SOLO si se completó manualmente/oficialmente
  if (list.status === 'completada' || list.status === 'Completada' || list.isCompleted) return 'completada';

  // 2. Matemáticas puras basadas en los ítems actuales
  const total = list.items?.length || 0;
  if (total === 0) return 'pendiente';

  const completed = list.items.filter(i => i.completed).length;

  if (completed === total) return 'completada';
  if (completed > 0) return 'en progreso'; // Basta con 1 para estar en progreso
  
  return 'pendiente';
};
