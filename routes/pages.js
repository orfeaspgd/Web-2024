import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function pagesRoutes(app) {
    // Home page route for all users (admin, citizen, rescuer)
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

    // Admin pages routes
    app.get('/create-announcement', (req, res) => {
        if (req.session.user) {
            res.sendFile(path.join(__dirname, '../frontend/html/admin/create-announcement.html'));
        } else {
            res.redirect("/login");
        }
    });

    app.get('/create-rescuer', (req, res) => {
        if (req.session.user) {
            res.sendFile(path.join(__dirname, '../frontend/html/admin/create-rescuer.html'));
        } else {
            res.redirect("/login");
        }
    });

    app.get('/map-view', (req, res) => {
        if (req.session.user) {
            res.sendFile(path.join(__dirname, '../frontend/html/admin/map-view.html'));
        } else {
            res.redirect("/login");
        }
    });

    app.get('/service-statistics', (req, res) => {
        if (req.session.user) {
            res.sendFile(path.join(__dirname, '../frontend/html/admin/service-statistics.html'));
        } else {
            res.redirect("/login");
        }
    });

    // Citizen pages routes
    app.get('/announcement-offer-management', (req, res) => {
        if (req.session.user) {
            res.sendFile(path.join(__dirname, '../frontend/html/citizen/announcement-offer-management.html'));
        } else {
            res.redirect("/login");
        }
    });

    app.get('/account-creation', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/html/citizen/create-account.html'));
    });

    // Rescuer pages routes
    app.get('/map-view-rescuer', (req, res) => {
        if (req.session.user) {
            res.sendFile(path.join(__dirname, '../frontend/html/rescuer/map-view.html'));
        } else {
            res.redirect("/login");
        }
    });
}