// Traduce el slug usado en la URL (?tipo=...) al valor real guardado en BD.
export const MATERIAL_TYPE_SLUGS = {
    devolutivo: "Devolutivo",
    consumo: "Consumo",
    "muebles-y-enseres": "Muebles y enseres",
};

export async function getMaterialTypes() {
    return [
        { label: "Material devolutivo", value: "Devolutivo" },
        { label: "Material de Consumo", value: "Consumo" },
        { label: "Muebles y enseres", value: "Muebles y enseres" },
    ];
}