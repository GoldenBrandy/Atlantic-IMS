// Traduce el slug usado en la URL (?tipo=...) al valor real guardado en BD.
export const MATERIAL_TYPE_SLUGS = {
    devolutivo: "Devolutivo",
    consumo: "Consumo",
    "muebles-y-enseres": "Muebles y enseres",
};

// Categorias para material devolutivo (bienes que se prestan/depreciaron,
// no se consumen). Se guardan como texto libre igual que "type".
export const MATERIAL_CATEGORY_OPTIONS = [
    { id: "herramienta", label: "Herramienta" },
    { id: "tecnologia", label: "Tecnología" },
    { id: "mobiliario", label: "Mobiliario" },
    { id: "audiovisual", label: "Equipo audiovisual" },
    { id: "laboratorio", label: "Laboratorio" },
    { id: "seguridad", label: "Seguridad industrial" },
    { id: "oficina", label: "Oficina" },
    { id: "otro", label: "Otro" },
];

export async function getMaterialTypes() {
    return [
        { label: "Material devolutivo", value: "Devolutivo" },
        { label: "Material de Consumo", value: "Consumo" },
        { label: "Muebles y enseres", value: "Muebles y enseres" },
    ];
}