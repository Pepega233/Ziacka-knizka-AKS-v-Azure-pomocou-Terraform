import express from "express";
import { requireLogin, authorize } from "../service/Security.js";
import * as db from "../db/Database.js";
const router = express.Router();

//   ŠTUDENT – ZOZNAM PREDMETOV
// Hlavná stránka študenta – zoznam jeho predmetov
router.get(
    "/",
    requireLogin,           // používateľ musí byť prihlásený
    authorize("student"),   // musí mať rolu študent
    async (req, res) => {

        // ID prihláseného študenta zo session
        const studentId = req.session.user.id_user;

        // Načítanie všetkých predmetov, ktoré študent navštevuje
        // Logika:
        // študent → trieda → učitelia → predmety
        const subjects = await db.query(`
            SELECT DISTINCT
                s.id_subject,
                s.name_subject
            FROM student_class sc
                     JOIN teacher_subject_class tsc ON tsc.id_class = sc.id_class
                     JOIN subject s ON s.id_subject = tsc.id_subject
            WHERE sc.id_student = ?
            ORDER BY s.name_subject
        `, [studentId]);

        // Vykreslenie hlavnej študentskej stránky
        res.render("student/index.html.njk", { subjects });
    }
);

//   ŠTUDENT – DETAIL PREDMETU

// Detail konkrétneho predmetu – známky študenta
router.get(
    "/subject/:subjectId",
    requireLogin,           // študent musí byť prihlásený
    authorize("student"),   // prístup len pre študenta
    async (req, res) => {

        // ID prihláseného študenta
        const studentId = req.session.user.id_user;

        // ID predmetu z URL (napr. /subject/3)
        const { subjectId } = req.params;

        // Načítanie všetkých známok študenta z daného predmetu
        const grades = await db.query(`
            SELECT
                g.value,
                g.note,
                DATE_FORMAT(g.created, '%H:%i:%s %d.%m.%Y') AS created
            FROM grade g
            WHERE g.id_student = ?
              AND g.id_subject = ?
            ORDER BY g.created DESC
        `, [studentId, subjectId]);

        // Výpočet priemernej známky
        const average = await db.query(`
            SELECT ROUND(AVG(value), 2) AS avg_grade
            FROM grade
            WHERE id_student = ?
              AND id_subject = ?
        `, [studentId, subjectId]);


        // Načítanie informácií o predmete a meno učiteľa
        const studentClass = await db.query(`
            SELECT id_class
            FROM student_class
            WHERE id_student = ?
                LIMIT 1
        `, [studentId]);

        const classId = studentClass[0]?.id_class;

        const subjects = await db.query(`
            SELECT
                s.id_subject,
                s.name_subject,
                u.name AS teacher_name,
                u.lastname AS teacher_lastname
            FROM subject s
                     JOIN teacher_subject_class tsc
                          ON tsc.id_subject = s.id_subject
                     JOIN user u
                          ON u.id_user = tsc.id_teacher
            WHERE s.id_subject = ?
              AND tsc.id_class = ?
                LIMIT 1
        `, [subjectId, classId]);




        // Vykreslenie detailu predmetu
        res.render("student/subject.html.njk", {
            grades,                              // zoznam známok
            average: average[0].avg_grade,       // priemer
            subject: subjects[0],                // názov predmetu
        });
    }
);

export { router as StudentController };
