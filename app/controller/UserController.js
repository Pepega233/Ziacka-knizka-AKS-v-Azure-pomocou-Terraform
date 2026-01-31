import express from 'express';
import { authenticate } from '../service/Security.js';

// Router pre používateľskú časť aplikácie
const router = express.Router();

/**
 * ==============================
 * PRIHLÁSENIE – FORMULÁR
 * ==============================
 * Zobrazí prihlasovaciu stránku
 */
router.get("/login", (req, res) => {
    res.render("user/login.html.njk");
});

/**
 * ==============================
 * PRIHLÁSENIE – SPRACOVANIE
 * ==============================
 */
router.post("/check", async (req, res) => {

    // Overenie mena a hesla
    const user = await authenticate(req.body.username, req.body.password);

    // Ak je autentifikácia neúspešná
    if (!user) {
        req.flash('error', 'Nesprávne meno alebo heslo.');
        return res.redirect('/user/login');
    }

    // Uloženie používateľa do session
    req.session.user = user;

    // Uloženie session a presmerovanie podľa roly
    req.session.save(() => {

        // Admin
        if (user.roles.includes("admin")) {
            return res.redirect("/admin");
        }

        // Učiteľ
        if (user.roles.includes("teacher")) {
            return res.redirect("/teacher");
        }

        // Študent
        if (user.roles.includes("student")) {
            return res.redirect("/student");
        }

        // Fallback
        res.redirect("/user/login");
    });
});


/**
 * ==============================
 * ODHLÁSENIE
 * ==============================
 */
router.get("/logout", function (req, res) {

    // Názov session cookie
    let sessionName = req.session.name;

    // Zrušenie session
    req.session.destroy(function(err) {

        if (err) {
            console.error(err);
        } else {
            console.log('Logout OK');

            // Zmazanie session cookie
            res.clearCookie(sessionName);

            // Presmerovanie na úvodnú stránku
            res.redirect('/');
        }
    });
});

export { router as UserController };
