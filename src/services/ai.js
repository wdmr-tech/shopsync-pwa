import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateListWithGemini = async (userPrompt) => {
  // Inicializa el cliente (Reemplaza con tu variable de entorno en producción o usa localStorage)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('VITE_GEMINI_API_KEY') || "TU_API_KEY_AQUI"; 
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Usamos gemini-1.5-flash porque es más rápido y barato para tareas de texto
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // SYSTEM PROMPT ESTRICTO PARA FORZAR JSON
  const systemPrompt = `
  Eres un asistente experto en compras y organización. Tu tarea es leer la necesidad del usuario y devolver una lista de compras completa, realista y detallada, formateada ESTRICTAMENTE como un objeto JSON válido, sin Markdown (sin \`\`\`json), sin explicaciones y sin texto adicional.
  
  La estructura obligatoria del JSON debe ser exactamente esta:
  {
    "name": "Título corto y atractivo para la lista",
    "emoji": "Un solo emoji representativo",
    "description": "Una breve descripción de una línea de la lista generada",
    "category": "Una de estas opciones: Recetas, Viajes, Hogar, Eventos, Otros",
    "items": [
      { "name": "Nombre del producto 1", "quantity": "cantidad en número", "unit": "unidad de medida (ej. kilos, litros, unidades, gramos, paquete)" },
      { "name": "Nombre del producto 2", "quantity": "cantidad", "unit": "unidad" }
    ]
  }

  Instrucciones clave:
  - Añade todos los productos que el usuario podría necesitar lógicamente basándote en su prompt.
  - Asegúrate de que las unidades tengan sentido (ej. no pongas "1 gramos de pan", pon "1 kilo de pan" o "1 unidad").
  - Si el usuario menciona cantidades de personas, ajusta las porciones (quantity).
  - DEBES DEVOLVER SOLO EL JSON.
  `;

  try {
    const result = await model.generateContent(`${systemPrompt}\n\nInput del usuario: "${userPrompt}"`);
    const response = await result.response;
    let text = response.text();
    
    // Limpieza de seguridad por si Gemini incluye markdown
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    return JSON.parse(text); // Devuelve el objeto estructurado
  } catch (error) {
    console.error("Error en Gemini API:", error);
    throw new Error(error.message || "No se pudo generar la lista");
  }
};
