import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function pagesRoutes(app) {
    app.get('/account-creation', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/html/citizen/create-account.html'));
    });

    app.get('/home', (req, res) => {
        if (req.session.user && req.session.user.role === 'admin') {
            res.sendFile(path.join(__dirname, '../frontend/html/admin/warehouse.html'));
        } else if (req.session.user && req.session.user.role === 'citizen') {
            res.sendFile(path.join(__dirname, '../frontend/html/citizen/request-management.html'));
        } else if (req.session.user && req.session.user.role === 'rescuer') {
            res.sendFile(path.join(__dirname, '../frontend/html/rescuer/cargo-management.html'));
        } else {
            res.redirect("/login");
        }
    });

    app.get('/create-announcement', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/html/admin/create-announcement.html'));
    });

    app.get('/create-rescuer', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/html/admin/create-rescuer.html'));
    });

    app.get('/map-view', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/html/admin/map-view.html'));
    });

    app.get('/service-statistics', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/html/admin/service-statistics.html'));
    });
}
