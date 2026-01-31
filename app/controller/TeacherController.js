import express from "express";
import { requireLogin, authorize } from "../service/Security.js";
import * as db from "../db/Database.js";
import { sendMail } from "../service/MailService.js";
const router = express.Router();

//   DASHBOARD – TRIEDY UČITEĽA

// Hlavná stránka učiteľa – zoznam tried, ktoré učí
router.get("/", requireLogin, authorize("teacher"), async (req, res) => {

    // ID prihláseného učiteľa zo session
    const teacherId = req.session.user.id_user;

    // Načítanie všetkých tried, v ktorých učiteľ vyučuje aspoň jeden predmet
    const classes = await db.query(`
        SELECT DISTINCT c.id_class, c.year, c.class1
        FROM teacher_subject_class tsc
        JOIN class c ON c.id_class = tsc.id_class
        WHERE tsc.id_teacher = ?
        ORDER BY c.year, c.class1
    `, [teacherId]);

    // Vykreslenie hlavnej učiteľskej stránky
    res.render("teacher/index.html.njk", { classes });
});

//   PREDMETY V TRIEDE

// Zoznam predmetov, ktoré učiteľ učí v konkrétnej triede
router.get("/classes/:classId", requireLogin, authorize("teacher"), async (req, res) => {

    const teacherId = req.session.user.id_user;
    const { classId } = req.params;

    // Načítanie predmetov učiteľa v danej triede
    const subjects = await db.query(`
        SELECT s.id_subject, s.name_subject, c.year, c.class1
        FROM teacher_subject_class tsc
        JOIN subject s ON s.id_subject = tsc.id_subject
        JOIN class c ON c.id_class = tsc.id_class
        WHERE tsc.id_teacher = ?
          AND tsc.id_class = ?
        ORDER BY s.name_subject
    `, [teacherId, classId]);

    res.render("teacher/classes/list.html.njk", {
        subjects,
        classId
    });
});


//   DETAIL PREDMETU – ZOZNAM ŽIAKOV

// Zoznam žiakov v triede + ich známky z konkrétneho predmetu
router.get(
    "/classes/:classId/subject/:subjectId",
    requireLogin,
    authorize("teacher"),
    async (req, res) => {

        const { classId, subjectId } = req.params;
        const teacherId = req.session.user.id_user;

        // Načítanie žiakov a ich známok
        // LEFT JOIN → aj žiak bez známky sa zobrazí
        const students = await db.query(`
            SELECT
                u.id_user,
                u.name,
                u.lastname,
                GROUP_CONCAT(
                    CONCAT(
                        g.value,
                        IF(g.note IS NOT NULL AND g.note != '', CONCAT(' (', g.note, ')'), '')
                    )
                    ORDER BY g.id_grade SEPARATOR ', '
                ) AS grades
            FROM student_class sc
            JOIN user u ON u.id_user = sc.id_student
            LEFT JOIN grade g
                ON g.id_student = u.id_user
               AND g.id_subject = ?
               AND g.id_class = ?
            WHERE sc.id_class = ?
            GROUP BY u.id_user, u.name, u.lastname
        `, [subjectId, classId, classId]);

        // Overenie, že učiteľ tento predmet v triede naozaj učí
        const subject = await db.query(`
            SELECT s.id_subject, s.name_subject, c.year, c.class1
            FROM teacher_subject_class tsc
            JOIN subject s ON s.id_subject = tsc.id_subject
            JOIN class c ON c.id_class = tsc.id_class
            WHERE tsc.id_teacher = ?
              AND tsc.id_class = ?
              AND tsc.id_subject = ?
            LIMIT 1
        `, [teacherId, classId, subjectId]);

        res.render("teacher/classes/detail.html.njk", {
            students,
            subject: subject[0],
            classId,
            subjectId
        });
    }
);

//   FORMULÁR NA ZÁPIS ZNÁMOK

// Formulár, kde učiteľ zapisuje a upravuje známky
router.get(
    "/classes/:classId/subject/edit/:subjectId",
    requireLogin,
    authorize("teacher"),
    async (req, res) => {

        const { classId, subjectId } = req.params;
        const teacherId = req.session.user.id_user;

        // Zoznam žiakov v triede
        const students = await db.query(`
            SELECT u.id_user, u.name, u.lastname
            FROM student_class sc
            JOIN user u ON u.id_user = sc.id_student
            WHERE sc.id_class = ?
        `, [classId]);

        // Overenie predmetu a triedy
        const subject = await db.query(`
            SELECT s.id_subject, s.name_subject, c.year, c.class1
            FROM teacher_subject_class tsc
            JOIN subject s ON s.id_subject = tsc.id_subject
            JOIN class c ON c.id_class = tsc.id_class
            WHERE tsc.id_teacher = ?
              AND tsc.id_class = ?
              AND tsc.id_subject = ?
            LIMIT 1
        `, [teacherId, classId, subjectId]);

        // Všetky známky z predmetu
        const grades = await db.query(`
            SELECT g.id_grade,
                   g.id_student,
                   g.value,
                   g.note
            FROM grade g
            WHERE g.id_subject = ?
        `, [subjectId]);

        // Rozdelenie známok podľa študentov
        const gradesByStudent = {};

        for (const g of grades) {
            if (!gradesByStudent[g.id_student]) {
                gradesByStudent[g.id_student] = [];
            }
            gradesByStudent[g.id_student].push(g);
        }

        // Priradenie známok ku každému študentovi
        for (const s of students) {
            s.grades = gradesByStudent[s.id_user] || [];
        }

        res.render("teacher/classes/edit.html.njk", {
            students,
            subject: subject[0],
            classId,
            subjectId
        });
    }
);

//  PRIDANIE ZNÁMKY

router.post(
    "/classes/:classId/subject/:subjectId/grade/add",
    requireLogin,
    authorize("teacher"),
    async (req, res) => {

        const { classId, subjectId } = req.params;
        const teacherId = req.session.user.id_user;
        const { studentId, value, note } = req.body;

        // Validácia
        if (!studentId || !value) {
            req.flash("error", "Chýbajú údaje");
            return res.redirect("back");
        }

        // Vloženie známky do databázy
        await db.query(`
            INSERT INTO grade
                (id_student, id_teacher, id_class, id_subject, value, note)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            studentId,
            teacherId,
            classId,
            subjectId,
            value,
            note || ""
        ]);

        // Načítanie údajov pre mail
        const student = await db.query(
            "SELECT email, name FROM user WHERE id_user = ?",
            [studentId]
        );

        const teacher = await db.query(
            "SELECT name, lastname FROM user WHERE id_user = ?",
            [teacherId]
        );

        const subject = await db.query(
            "SELECT name_subject FROM subject WHERE id_subject = ?",
            [subjectId]
        );

        // Odoslanie mailu študentovi
        if (student.length && student[0].email) {
            await sendMail({
                to: student[0].email,
                subject: "Nová známka",
                text: `Ahoj ${student[0].name},
bola ti zapísaná nová známka: ${value}
Predmet: ${subject[0].name_subject}
Učiteľ: ${teacher[0].name} ${teacher[0].lastname}
Poznámka: ${note || "-"}

— Školský systém`
            });
        }

        req.flash("success", "Známka bola pridaná");
        res.redirect(`/teacher/classes/${classId}/subject/edit/${subjectId}`);
    }
);

//   ÚPRAVA ZNÁMKY

router.post(
    "/classes/:classId/subject/:subjectId/grade/:gradeId/edit",
    requireLogin,
    authorize("teacher"),
    async (req, res) => {

        const { classId, subjectId, gradeId } = req.params;
        const teacherId = req.session.user.id_user;
        const { value, note } = req.body;

        if (!value) {
            req.flash("error", "Známka je povinná");
            return res.redirect("back");
        }

        // Načítanie pôvodnej známky (kontrola vlastníctva)
        const grade = await db.query(`
            SELECT g.value AS oldValue,
                   g.id_student,
                   u.email,
                   u.name
            FROM grade g
            JOIN user u ON u.id_user = g.id_student
            WHERE g.id_grade = ?
              AND g.id_teacher = ?
            LIMIT 1
        `, [gradeId, teacherId]);

        if (!grade.length) {
            req.flash("error", "Známka neexistuje");
            return res.redirect("back");
        }

        // Aktualizácia známky
        await db.query(`
            UPDATE grade
            SET value = ?, note = ?
            WHERE id_grade = ?
        `, [value, note || "", gradeId]);

        const teacher = await db.query(
            "SELECT name, lastname FROM user WHERE id_user = ?",
            [teacherId]
        );

        const subject = await db.query(
            "SELECT name_subject FROM subject WHERE id_subject = ?",
            [subjectId]
        );

        // Mail o zmene známky
        if (grade[0].email) {
            await sendMail({
                to: grade[0].email,
                subject: "Známka bola upravená",
                text: `Ahoj ${grade[0].name},
tvoja známka bola upravená:

Pôvodná: ${grade[0].oldValue}
Nová: ${value}

Predmet: ${subject[0].name_subject}
Učiteľ: ${teacher[0].name} ${teacher[0].lastname}
Poznámka: ${note || "-"}

— Školský systém`
            });
        }

        req.flash("edit", "Známka bola upravená");
        res.redirect(`/teacher/classes/${classId}/subject/edit/${subjectId}`);
    }
);

//   ZMAZANIE ZNÁMKY

router.post(
    "/classes/:classId/subject/:subjectId/grade/:gradeId/delete",
    requireLogin,
    authorize("teacher"),
    async (req, res) => {

        const { classId, subjectId, gradeId } = req.params;
        const teacherId = req.session.user.id_user;

        // Načítanie známky pred zmazaním
        const grade = await db.query(`
            SELECT g.value,
                   g.id_student,
                   u.email,
                   u.name
            FROM grade g
            JOIN user u ON u.id_user = g.id_student
            WHERE g.id_grade = ?
              AND g.id_subject = ?
              AND g.id_teacher = ?
            LIMIT 1
        `, [gradeId, subjectId, teacherId]);

        const teacher = await db.query(
            "SELECT name, lastname FROM user WHERE id_user = ?",
            [teacherId]
        );

        const subject = await db.query(
            "SELECT name_subject FROM subject WHERE id_subject = ?",
            [subjectId]
        );

        if (!grade.length) {
            req.flash("error", "Známka neexistuje");
            return res.redirect("back");
        }

        // Zmazanie známky
        await db.query(
            "DELETE FROM grade WHERE id_grade = ?",
            [gradeId]
        );

        // Mail o odstránení známky
        if (grade[0].email) {
            await sendMail({
                to: grade[0].email,
                subject: "Známka bola odstránená",
                text: `Ahoj ${grade[0].name},
tvoja známka ${grade[0].value} bola odstránená.
Predmet: ${subject[0].name_subject}
Učiteľ: ${teacher[0].name} ${teacher[0].lastname}
— Školský systém`
            });
        }

        req.flash("delete", "Známka bola odstránená");
        res.redirect(`/teacher/classes/${classId}/subject/edit/${subjectId}`);
    }
);

export { router as TeacherController };
