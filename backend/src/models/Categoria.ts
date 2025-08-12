export type Categoria = {
    id: number;
    campo: string; // "zona", "semana", "tipoCliente", etc.
    valor: string; // "FIJO", "1A", etc.
    color: string | null;
    deleteAt: string | null; // Nuevo campo para el color en formato hexadecimal (ej. "#00FF00")
};