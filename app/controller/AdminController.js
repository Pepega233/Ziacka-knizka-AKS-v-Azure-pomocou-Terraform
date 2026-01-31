import express from "express";
import { requireLogin, authorize } from "../service/Security.js";
import * as db from "../db/Database.js";
import argon2 from "argon2";
const router = express.Router();

//   DASHBOARD
// Hlavná admin stránka – prístup len pre admina
router.get("/", requireLogin, authorize("admin"), (req, res) => {
    res.render("admin/index.html.njk");
});

//   REGISTRÁCIA POUŽÍVATEĽA – FORM

router.get("/register", requireLogin, authorize("admin"), async (req, res) => {

    // Načítanie všetkých predmetov (pre učiteľov)
    const subjects = await db.query(
        "SELECT id_subject, name_subject FROM subject"
    );

    // Načítanie všetkých tried (pre žiakov)
    const classes = await db.query(
        "SELECT id_class, year, class1 FROM class"
    );

    // Vykreslenie registračného formulára
    res.render("admin/register.html.njk", {
        subjects,
        classes
    });
});

//   REGISTRÁCIA POUŽÍVATEĽA – SAVE

router.post("/register", requireLogin, authorize("admin"), async (req, res) => {

    // Dáta z formulára
    const {
        username,
        password,
        first_name,
        last_name,
        email,
        role,
        id_subject,
        id_class
    } = req.body;

    // Kontrola povinných polí
    if (!username || !password || !first_name || !last_name || !role) {
        return res.redirect("/admin/register");
    }

    // Hashovanie hesla
    const hash = await argon2.hash(password);

    // Vloženie používateľa do tabuľky user
    const result = await db.query(
        `INSERT INTO user (username, password, name, lastname, email, roles)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [username, hash, first_name, last_name, email, role]
    );

    // ID nového používateľa
    const userId = result.insertId;


    // VÄZBY PODĽA ROLE

    // ŽIAK → TRIEDA
    if (role === "student" && id_class) {
        await db.query(
            "INSERT INTO student_class (id_student, id_class) VALUES (?, ?)",
            [userId, id_class]
        );
    }

    // UČITEĽ → PREDMET (bez triedy)
    if (role === "teacher" && id_subject) {
        await db.query(
            "INSERT INTO teacher_subject_class (id_teacher, id_subject) VALUES (?, ?)",
            [userId, id_subject]
        );
    }

    // Flash správa
    req.flash("success", "Uživateľ bol úspešne pridaný.");

    // Presmerovanie na zoznam používateľov
    res.redirect("/admin/users");
});

//  USERS – ZOZNAM

router.get("/users", requireLogin, authorize("admin"), async (req, res) => {

    // Načítanie používateľov
    const users = await db.query(
        "SELECT id_user, username, name, lastname, roles FROM user"
    );

    res.render("admin/users/list.html.njk", { users });
});

//   USERS – DELETE

router.post("/users/delete/:id", requireLogin, authorize("admin"), async (req, res) => {

    // Admina nie je možné vymazať
    await db.query(
        "DELETE FROM user WHERE id_user = ? AND roles != 'admin'",
        [req.params.id]
    );

    req.flash("delete", "Uživateľ bol úspešne odstránený.");
    res.redirect("/admin/users");
});

//   USERS – EDIT (FORM)

router.get("/users/edit/:id", requireLogin, authorize("admin"), async (req, res) => {

    // Používateľ
    const user = await db.query(
        "SELECT id_user, username, name, lastname, email, roles FROM user WHERE id_user = ?",
        [req.params.id]
    );

    if (!user.length) {
        return res.redirect("/admin/users");
    }

    // Všetky predmety
    const subjects = await db.query(
        "SELECT id_subject, name_subject FROM subject"
    );

    // Všetky triedy
    const classes = await db.query(
        "SELECT id_class, year, class1 FROM class"
    );

    // Predmety učiteľa
    const teacherSubjects = await db.query(
        "SELECT id_subject FROM teacher_subject_class WHERE id_teacher = ?",
        [req.params.id]
    );

    // Trieda žiaka
    const studentClass = await db.query(
        "SELECT id_class FROM student_class WHERE id_student = ?",
        [req.params.id]
    );

    res.render("admin/users/edit.html.njk", {
        user: user[0],
        subjects,
        classes,
        teacherSubjects,
        studentClass: studentClass[0] ?? null
    });
});

//   USERS – EDIT (SAVE)

router.post("/users/edit/:id", requireLogin, authorize("admin"), async (req, res) => {

    const {
        username,
        name,
        lastname,
        email,
        password,
        roles,
        id_class,
        id_subject
    } = req.body;

    // Základná aktualizácia údajov
    await db.query(
        `UPDATE user
         SET username = ?, name = ?, lastname = ?, email = ?, roles = ?
         WHERE id_user = ?`,
        [username, name, lastname, email, roles, req.params.id]
    );

    // Zmena hesla len ak je zadané
    if (password && password.trim() !== "") {
        const hash = await argon2.hash(password);
        await db.query(
            "UPDATE user SET password = ? WHERE id_user = ?",
            [hash, req.params.id]
        );
    }

    // Vymazanie starých väzieb
    await db.query("DELETE FROM student_class WHERE id_student = ?", [req.params.id]);
    await db.query("DELETE FROM teacher_subject_class WHERE id_teacher = ?", [req.params.id]);

    // Nové väzby
    if (roles === "student" && id_class) {
        await db.query(
            "INSERT INTO student_class (id_student, id_class) VALUES (?, ?)",
            [req.params.id, id_class]
        );
    }

    if (roles === "teacher" && id_subject) {
        await db.query(
            "INSERT INTO teacher_subject (id_teacher, id_subject) VALUES (?, ?)",
            [req.params.id, id_subject]
        );
    }

    req.flash("edit", "Používateľ bol upravený");
    res.redirect("/admin/users");
});

//  USER DETAIL


router.get("/users/:id", requireLogin, authorize("admin"), async (req, res) => {

    const userId = req.params.id;

    // Používateľ
    const users = await db.query(
        "SELECT id_user, username, name, lastname, roles FROM user WHERE id_user = ?",
        [userId]
    );

    if (!users.length) {
        return res.redirect("/admin/users");
    }

    const user = users[0];

    let studentClass = null;
    let teacherAssignments = [];

    // ŽIAK → TRIEDA
    if (user.roles === "student") {
        const rows = await db.query(`
            SELECT c.year, c.class1
            FROM student_class sc
            JOIN class c ON c.id_class = sc.id_class
            WHERE sc.id_student = ?
        `, [userId]);

        studentClass = rows[0] || null;
    }

    // UČITEĽ → PREDMETY + TRIEDY
    if (user.roles === "teacher") {
        teacherAssignments = await db.query(`
            SELECT s.name_subject, c.year, c.class1
            FROM teacher_subject_class tsc
            JOIN subject s ON s.id_subject = tsc.id_subject
            JOIN class c ON c.id_class = tsc.id_class
            WHERE tsc.id_teacher = ?
        `, [userId]);
    }

    res.render("admin/users/detail.html.njk", {
        user,
        studentClass,
        teacherAssignments
    });
});

//  TRIEDY – CRUD


// Zoznam tried
router.get("/classes", requireLogin, authorize("admin"), async (req, res) => {
    const classes = await db.query(
        "SELECT * FROM class ORDER BY year, class1"
    );

    res.render("admin/classes/list.html.njk", { classes });
});

// Vymazanie triedy
router.post("/classes/delete/:id", requireLogin, authorize("admin"), async (req, res) => {
    await db.query(
        "DELETE FROM class WHERE id_class = ?",
        [req.params.id]
    );

    req.flash("delete", "Trieda bola odstránená");
    res.redirect("/admin/classes");
});

// Edit triedy – form
router.get("/classes/edit/:id", requireLogin, authorize("admin"), async (req, res) => {
    const result = await db.query(
        "SELECT * FROM class WHERE id_class = ?",
        [req.params.id]
    );

    if (!result.length) {
        req.flash("error", "Trieda neexistuje");
        return res.redirect("/admin/classes");
    }

    res.render("admin/classes/edit.html.njk", {
        schoolClass: result[0]
    });
});

// Edit triedy – save
router.post("/classes/edit/:id", requireLogin, authorize("admin"), async (req, res) => {
    const { year, class1 } = req.body;

    await db.query(
        "UPDATE class SET year = ?, class1 = ? WHERE id_class = ?",
        [year, class1, req.params.id]
    );

    req.flash("edit", "Trieda bola upravená");
    res.redirect("/admin/classes");
});

// Vytvorenie triedy – form
router.get("/classes/create", requireLogin, authorize("admin"), (req, res) => {
    res.render("admin/classes/create.html.njk");
});

// Vytvorenie triedy – save
router.post("/classes", requireLogin, authorize("admin"), async (req, res) => {
    const { year, class1 } = req.body;

    await db.query(
        "INSERT INTO class (year, class1) VALUES (?, ?)",
        [year, class1]
    );

    req.flash("success", "Trieda bola vytvorená");
    res.redirect("/admin/classes");
});

// Detail triedy – zoznam žiakov
router.get("/classes/:id", requireLogin, authorize("admin"), async (req, res) => {

    const classId = req.params.id;

    // Trieda
    const classItem = await db.query(
        "SELECT year, class1 FROM class WHERE id_class = ?",
        [classId]
    );

    if (!classItem.length) {
        return res.redirect("/admin/classes");
    }

    // Žiaci v triede
    const students = await db.query(`
        SELECT u.id_user, u.username, u.name, u.lastname, u.email
        FROM student_class sc
        JOIN user u ON u.id_user = sc.id_student
        WHERE sc.id_class = ?
    `, [classId]);

    res.render("admin/classes/detail.html.njk", {
        classItem: classItem[0],
        students
    });
});

//   PREDMETY – CRUD

// Zoznam predmetov
router.get("/subjects", requireLogin, authorize("admin"), async (req, res) => {
    const subjects = await db.query(
        "SELECT id_subject, name_subject FROM subject"
    );

    res.render("admin/subjects/list.html.njk", { subjects });
});

// Create predmet – form
router.get("/subjects/create", requireLogin, authorize("admin"), (req, res) => {
    res.render("admin/subjects/create.html.njk");
});

// Create predmet – save
router.post("/subjects/create", requireLogin, authorize("admin"), async (req, res) => {
    const { name_subject } = req.body;

    if (!name_subject) {
        req.flash("error", "Zadaj názov predmetu");
        return res.redirect("/admin/subjects/create");
    }

    await db.query(
        "INSERT INTO subject (name_subject) VALUES (?)",
        [name_subject]
    );

    req.flash("success", "Predmet bol vytvorený.");
    res.redirect("/admin/subjects");
});

// Edit predmet – form
router.get("/subjects/edit/:id", requireLogin, authorize("admin"), async (req, res) => {
    const subject = await db.query(
        "SELECT id_subject, name_subject FROM subject WHERE id_subject = ?",
        [req.params.id]
    );

    if (!subject.length) {
        req.flash("error", "Predmet neexistuje");
        return res.redirect("/admin/subjects");
    }

    res.render("admin/subjects/edit.html.njk", {
        subject: subject[0]
    });
});

// Edit predmet – save
router.post("/subjects/edit/:id", requireLogin, authorize("admin"), async (req, res) => {
    const { name_subject } = req.body;

    await db.query(
        "UPDATE subject SET name_subject = ? WHERE id_subject = ?",
        [name_subject, req.params.id]
    );

    req.flash("edit", "Predmet bol upravený.");
    res.redirect("/admin/subjects");
});

// Delete predmet
router.post("/subjects/delete/:id", requireLogin, authorize("admin"), async (req, res) => {
    await db.query(
        "DELETE FROM subject WHERE id_subject = ?",
        [req.params.id]
    );

    req.flash("delete", "Predmet bol odstránený.");
    res.redirect("/admin/subjects");
});

//   ZARADENIE ŽIAKA DO TRIEDY

router.get("/assign/student", requireLogin, authorize("admin"), async (req, res) => {

    const students = await db.query(
        "SELECT id_user, name, lastname FROM user WHERE roles='student'"
    );

    const classes = await db.query("SELECT * FROM class");

    res.render("admin/assign/student_class.html.njk", {
        students,
        classes
    });
});

router.post("/assign/student", requireLogin, authorize("admin"), async (req, res) => {

    const { id_student, id_class } = req.body;

    // REPLACE → žiak môže byť len v jednej triede
    await db.query(
        "REPLACE INTO student_class (id_student, id_class) VALUES (?, ?)",
        [id_student, id_class]
    );

    req.flash("success", "Žiak bol pridaný do triedy.");
    res.redirect("/admin/assign/student");
});

//   PREDMET → TRIEDA

router.get("/assign/subject", requireLogin, authorize("admin"), async (req, res) => {

    const classes = await db.query("SELECT * FROM class");
    const subjects = await db.query("SELECT * FROM subject");

    res.render("admin/assign/class_subject.html.njk", {
        classes,
        subjects
    });
});

router.post("/assign/subject", requireLogin, authorize("admin"), async (req, res) => {

    const { id_class, id_subject } = req.body;

    // INSERT IGNORE → zabránenie duplicitám
    await db.query(
        "INSERT IGNORE INTO class_subject (id_class, id_subject) VALUES (?, ?)",
        [id_class, id_subject]
    );

    req.flash("success", "Predmet bol priradený k triede.");
    res.redirect("/admin/assign/subject");
});


 //  UČITEĽ → PREDMET → TRIEDA

router.get("/assign/teacher", requireLogin, authorize("admin"), async (req, res) => {

    const teachers = await db.query(
        "SELECT id_user, name, lastname FROM user WHERE roles='teacher'"
    );

    const classes = await db.query("SELECT * FROM class");
    const subjects = await db.query("SELECT * FROM subject");

    res.render("admin/assign/teacher.html.njk", {
        teachers,
        classes,
        subjects
    });
});

router.post("/assign/teacher", requireLogin, authorize("admin"), async (req, res) => {

    const { id_teacher, id_class, id_subject } = req.body;

    await db.query(
        `INSERT IGNORE INTO teacher_subject_class
         (id_teacher, id_class, id_subject)
         VALUES (?, ?, ?)`,
        [id_teacher, id_class, id_subject]
    );

    req.flash("success", "Učiteľ bol priradený k triede a predmetu.");
    res.redirect("/admin/assign/teacher");
});

export { router as AdminController };
