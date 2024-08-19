import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function pagesRoutes(app) {
    app.get('/account-creation', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/html/citizen/create-account.html'));
    });
}
