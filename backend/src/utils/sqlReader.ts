import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const queryCache = new Map<string, string>();

export const getSqlQuery = (fileName: string): string => {
    if (queryCache.has(fileName)) {
        return queryCache.get(fileName)!;
    }

    const filePath = join(__dirname, '..', 'sql', `${fileName}.sql`);

    try {
        const query = readFileSync(filePath, { encoding: 'utf-8' });
        queryCache.set(fileName, query);
        return query;
    } catch (error) {
        console.error(`Error leyendo el archivo SQL: ${fileName}.sql`, error);
        throw new Error(`No se pudo cargar la consulta: ${fileName}`);
    }
};