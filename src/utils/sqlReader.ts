import * as fs from 'fs';
import * as path from 'path';

const queryCache = new Map<string, string>();

export const getSqlQuery = (fileName: string): string => {
    if (queryCache.has(fileName)) {
        return queryCache.get(fileName)!;
    }

    const filePath = path.join(__dirname, '..', 'sql', `${fileName}.sql`);
    
    try {
        const query = fs.readFileSync(filePath, { encoding: 'utf-8' });
        queryCache.set(fileName, query);
        return query;
    } catch (error) {
        console.error(`Error leyendo el archivo SQL: ${fileName}.sql`, error);
        throw new Error(`No se pudo cargar la consulta: ${fileName}`);
    }
};