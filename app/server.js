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
    secret: "tajny_kod_pre_session",
    resave: false,
    saveUninitialized: false
}));

// flash správy (error, success)
app.use(flash());

// sprístupnenie flash správ do všetkých template-ov
app.use((req, res, next) => {
    res.locals.flash = req.flash();
    res.locals.user = req.session.user ?? null;
    next();
});


// ROUTING – CONTROLLERY

// základná stránka
app.get("/", (req, res) => {
    res.redirect("/user/login");
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

app.listen(PORT, () => {
    console.log(` Server počúva na adrese: http://localhost:${PORT}`);
});
