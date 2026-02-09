import express from "express";
import session from "express-session";
import path from "path";
import nunjucks from "nunjucks";
import flash from "connect-flash";

// Controllers
import { UserController } from "./controller/UserController.js";
import { AdminController } from "./controller/AdminController.js";
import { TeacherController } from "./controller/TeacherController.js";
import { StudentController } from "./controller/StudentController.js";

// Vytvorenie Express aplikácie
const app = express();

// Ak aplikácia beží za reverse proxy (napr. Kubernetes Ingress / Nginx),
// Express musí "veriť" proxy, inak môžu robiť problém cookies / session.
app.set("trust proxy", 1);


//   ZÁKLADNÉ NASTAVENIA


// port aplikácie
const PORT = 3000;

// root priečinok aplikácie
const __dirname = new URL(".", import.meta.url).pathname;


//   TEMPLATE ENGINE – NUNJUCKS

nunjucks.configure(path.join(__dirname, "templates"), {
    autoescape: true,
    express: app,
    watch: true
});

// nastavíme nunjucks ako view engine
app.set("view engine", "njk");


//   MIDDLEWARE

// parsovanie form data (POST)
app.use(express.urlencoded({ extended: true }));

// parsovanie JSON (ak by si ho potreboval)
app.use(express.json());

// session middleware
app.use(session({
    // Nech sa to dá nastaviť aj cez env (Docker/K8s)
    secret: process.env.SESSION_SECRET || "tajny_kod_pre_session",
    resave: false,
    saveUninitialized: false,
    // Cookie nastavenia – pri HTTP lokálne funguje secure:false,
    // pri HTTPS za proxy bude fungovať secure:true (vďaka trust proxy).
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        // "auto" = secure cookie sa zapne automaticky podľa toho,
        // či request prišiel cez HTTPS (napr. za Ingressom)
        secure: "auto"
    }
}));

// flash správy (error, success)
app.use(flash());

// Kompatibilita: v projekte sa používa res.flash(...) aj req.flash(...)
// connect-flash poskytuje len req.flash, tak spravíme jednoduchý alias.
app.use((req, res, next) => {
    res.flash = (type, message) => req.flash(type, message);
    next();
});

// sprístupnenie flash správ do všetkých template-ov
app.use((req, res, next) => {
    res.locals.flash = req.flash();
    res.locals.user = req.session.user ?? null;
    next();
});


// ROUTING – CONTROLLERY

// základná stránka
app.get("/", (req, res) => {
    // Ak nie je prihlásený, ide na login
    if (!req.session.user) {
        return res.redirect("/user/login");
    }

    // Ak je prihlásený, presmeruj podľa roly
    const roles = req.session.user.roles || [];
    if (roles.includes("admin")) return res.redirect("/admin");
    if (roles.includes("teacher")) return res.redirect("/teacher");
    if (roles.includes("student")) return res.redirect("/student");

    // Fallback
    return res.redirect("/user/login");
});

// user (login, logout, reset hesla)
app.use("/user", UserController);

// admin panel
app.use("/admin", AdminController);

// učiteľský panel
app.use("/teacher", TeacherController);

// študentský panel
app.use("/student", StudentController);


//   404 – STRÁNKA NENÁJDENÁ

app.use((req, res) => {
    res.status(404).send(
        `Stránka "${req.originalUrl}" neexistuje!`
    );
});


//   SPUSTENIE SERVERA

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server beží na porte ${PORT}`);
});

