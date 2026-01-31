-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Hostiteľ: cms-db
-- Čas generovania: So 17.Jan 2026, 19:27
-- Verzia serveru: 10.11.8-MariaDB-ubu2204
-- Verzia PHP: 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Databáza: `cms`
--

-- --------------------------------------------------------

--
-- Štruktúra tabuľky pre tabuľku `class`
--

CREATE TABLE `class` (
  `id_class` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `class1` char(1) NOT NULL,
  `created` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Sťahujem dáta pre tabuľku `class`
--

INSERT INTO `class` (`id_class`, `year`, `class1`, `created`) VALUES
(10, 1, 'A', '2026-01-11 20:04:57'),
(11, 1, 'B', '2026-01-17 18:18:37'),
(12, 1, 'C', '2026-01-17 18:18:40');

-- --------------------------------------------------------

--
-- Štruktúra tabuľky pre tabuľku `class_subject`
--

CREATE TABLE `class_subject` (
  `id_class` int(11) NOT NULL,
  `id_subject` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Sťahujem dáta pre tabuľku `class_subject`
--

INSERT INTO `class_subject` (`id_class`, `id_subject`) VALUES
(10, 3),
(10, 4),
(10, 5),
(10, 6),
(10, 7),
(10, 8),
(10, 9),
(11, 3),
(11, 4),
(11, 5),
(11, 6),
(11, 7),
(11, 8),
(11, 9),
(12, 3),
(12, 4),
(12, 5),
(12, 6),
(12, 7),
(12, 8),
(12, 9);

-- --------------------------------------------------------

--
-- Štruktúra tabuľky pre tabuľku `grade`
--

CREATE TABLE `grade` (
  `id_grade` int(11) NOT NULL,
  `id_student` int(11) NOT NULL,
  `id_teacher` int(11) NOT NULL,
  `id_class` int(11) NOT NULL,
  `id_subject` int(11) NOT NULL,
  `value` int(11) NOT NULL CHECK (`value` between 1 and 5),
  `created` timestamp NULL DEFAULT current_timestamp(),
  `note` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Štruktúra tabuľky pre tabuľku `student_class`
--

CREATE TABLE `student_class` (
  `id_student` int(11) NOT NULL,
  `id_class` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Sťahujem dáta pre tabuľku `student_class`
--

INSERT INTO `student_class` (`id_student`, `id_class`) VALUES
(44, 10),
(45, 10),
(46, 10),
(47, 10),
(48, 10),
(49, 10),
(50, 10),
(51, 10),
(52, 10),
(53, 10),
(55, 11),
(56, 11),
(57, 11),
(58, 11),
(59, 11),
(60, 11),
(61, 11),
(62, 11),
(63, 11),
(64, 11),
(65, 12),
(66, 12),
(67, 12),
(68, 12),
(69, 12),
(70, 12),
(71, 12),
(72, 12),
(73, 12),
(74, 12);

-- --------------------------------------------------------

--
-- Štruktúra tabuľky pre tabuľku `subject`
--

CREATE TABLE `subject` (
  `id_subject` int(11) NOT NULL,
  `name_subject` varchar(50) NOT NULL,
  `created` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Sťahujem dáta pre tabuľku `subject`
--

INSERT INTO `subject` (`id_subject`, `name_subject`, `created`) VALUES
(3, 'Matematika', '2025-12-27 11:52:51'),
(4, 'Informatika', '2025-12-27 11:52:55'),
(5, 'Slovenský jazyk', '2025-12-27 12:09:59'),
(6, 'Geografia', '2026-01-17 18:19:51'),
(7, 'Dejepis', '2026-01-17 18:19:59'),
(8, 'Telesná výchova', '2026-01-17 18:20:14'),
(9, 'Chémia', '2026-01-17 18:20:24');

-- --------------------------------------------------------

--
-- Štruktúra tabuľky pre tabuľku `teacher_subject_class`
--

CREATE TABLE `teacher_subject_class` (
  `id_teacher` int(11) NOT NULL,
  `id_class` int(11) NOT NULL,
  `id_subject` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Sťahujem dáta pre tabuľku `teacher_subject_class`
--

INSERT INTO `teacher_subject_class` (`id_teacher`, `id_class`, `id_subject`) VALUES
(75, 10, 3),
(75, 11, 3),
(75, 12, 3),
(76, 10, 4),
(76, 11, 4),
(76, 12, 4),
(77, 10, 5),
(77, 11, 5),
(77, 12, 5),
(78, 10, 6),
(78, 11, 6),
(78, 12, 6),
(79, 10, 7),
(79, 11, 7),
(79, 12, 7),
(80, 10, 8),
(80, 11, 8),
(80, 12, 8),
(81, 10, 9),
(81, 11, 9),
(81, 12, 9);

-- --------------------------------------------------------

--
-- Štruktúra tabuľky pre tabuľku `user`
--

CREATE TABLE `user` (
  `id_user` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `roles` enum('admin','teacher','student') NOT NULL,
  `created` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Sťahujem dáta pre tabuľku `user`
--

INSERT INTO `user` (`id_user`, `username`, `password`, `name`, `lastname`, `email`, `roles`, `created`) VALUES
(1, 'admin', '$argon2id$v=19$m=65536,t=3,p=4$3wNGOkaJfoRPFt3tyGmYjA$BQlEUQfxRKIbleVKNwVvH5BR/bwUPegd2ViEs3eNidw', 'admin', 'admin', 'admin@admin', 'admin', '2025-12-26 23:14:54'),
(44, 'ziak01', '$argon2id$v=19$m=65536,t=3,p=4$YhQEYEZzxtYPpy4VV7LuCw$AzLj2UBv58EJ8R4g0hK80IvTAKM319XyaORczEfVJw4', 'Adam', 'Novák', 'adam.novak@skola.sk', 'student', '2026-01-17 18:12:22'),
(45, 'ziak02', '$argon2id$v=19$m=65536,t=3,p=4$QHFHrIPyYMeCRV0hIntP/Q$byE2rDeU9TuhPOKc9OlJQLGQeA6gZ9oDuVaWy9KnX6E', 'Martin', 'Kováč ', 'martin.kovac@skola.sk', 'student', '2026-01-17 18:12:59'),
(46, 'ziak03', '$argon2id$v=19$m=65536,t=3,p=4$Jp7iGqSKWFtfS6BAuWsmqw$6Aex9NTlhalVdReTdYFUFcDaioIjBS54PiOR+9d3sLc', 'Peter', 'Horváth    ', 'peter.horvath@skola.sk', 'student', '2026-01-17 18:13:30'),
(47, 'ziak04   ', '$argon2id$v=19$m=65536,t=3,p=4$C1sUq2X9ARvtRez3ZbaQqg$GlKn4EqTweQSWWUpHQ9i87BYP3A2d81IEE4WY6RdBow', 'Lukáš         ', 'Tóth', 'lukas.toth@skola.sk', 'student', '2026-01-17 18:14:03'),
(48, 'ziak05', '$argon2id$v=19$m=65536,t=3,p=4$2pAiwSH8lhWJ0URz+O0f2Q$hjOMv8mTzGq5ix4Kdkj0c0g5l9QmZhsZXqCyy9YTBrY', 'Michal', 'Szabó   ', 'michal.szabo@skola.sk', 'student', '2026-01-17 18:14:35'),
(49, 'ziak06', '$argon2id$v=19$m=65536,t=3,p=4$Sz1oHNh9EPjaLOOeS8Sr0w$Hd9MdELBW5efHAcCLPanHv2J28pFib7FUfAixZwn+a8', 'Tomáš ', 'Baláž  ', 'tomas.balaz@skola.sk', 'student', '2026-01-17 18:14:59'),
(50, 'ziak07', '$argon2id$v=19$m=65536,t=3,p=4$GuHlvNqm1znLVJI1h6xYqw$Sj9QHQDAoutRJteeiKFOLqS3ZXEphf3a4KROIA80+D8', 'Filip', 'Polák', 'filip.polak@skola.sk', 'student', '2026-01-17 18:15:32'),
(51, 'ziak08', '$argon2id$v=19$m=65536,t=3,p=4$Pp/Ap3rUoTD8o9Cs0Cu9tQ$Xd3MuYpL5qRBRQFzUgGdl/DV6OiYKc+h66fb6gYUAsU', ' Juraj ', ' Král  ', 'juraj.kral@skola.sk', 'student', '2026-01-17 18:16:16'),
(52, 'ziak09', '$argon2id$v=19$m=65536,t=3,p=4$Yu6mt6bE/ILHhLCuZsXOaQ$++j20wGKv/gui1rsbrdjkSNysVwwiZ8TGOYdD92ZOCM', 'Samuel ', 'Benko', 'samuel.benko@skola.sk', 'student', '2026-01-17 18:16:47'),
(53, 'ziak10', '$argon2id$v=19$m=65536,t=3,p=4$quijrgV0Y2HTb69Fx9RFbA$0eBE+8WFhQPg+PxrdsCWCFvx/Se1luQDKWw2sP3xRt0', 'Jakub ', 'Urban ', 'jakub.urban@skola.sk', 'student', '2026-01-17 18:17:14'),
(55, 'ziak11', '$argon2id$v=19$m=65536,t=3,p=4$5vl5eNr6/+nK3nU3FF6g/A$DTCpmf79RZholAys37cjf9c+xMt9PCcVNpH0tyaPYk0', 'Dominik ', 'Blaško     ', 'dominik.blasko@skola.sk', 'student', '2026-01-17 18:24:22'),
(56, 'ziak12', '$argon2id$v=19$m=65536,t=3,p=4$Jqn07YUR61SDj0q15wt+Zw$Y1t2f9isA9iOLwAb+bTyxqbbpF/BP/e2XdBfs+XZJms', 'Marek   ', 'Hruška     ', 'marek.hruska@skola.sk', 'student', '2026-01-17 18:24:44'),
(57, 'ziak13', '$argon2id$v=19$m=65536,t=3,p=4$QUDyS+AtLEyoTeWGlWU2nQ$f4HfqwPHglLHPJSRRW22FnFDCj6cC0h7NVOPs8DZyQU', 'Andrej  ', 'Klement    ', 'andrej.klement@skola.sk', 'student', '2026-01-17 18:25:02'),
(58, 'ziak14', '$argon2id$v=19$m=65536,t=3,p=4$WIE/T/WdPMf3pQTSG2d4Mw$qsgBdSggUs1ANprbQKm5qzCjeG5lYi96RMFC6oQMRHw', 'Oliver  ', 'Hudec      ', 'oliver.hudec@skola.sk', 'student', '2026-01-17 18:25:24'),
(59, 'ziak15', '$argon2id$v=19$m=65536,t=3,p=4$tDjHoDMuLxmZ74ZeQt4mAg$7gneR8NtIDSbqbp4NH7QOtdgxG6fFFI9PGpWhYaSyQU', 'Daniel  ', 'Bartoš     ', 'daniel.bartos@skola.sk', 'student', '2026-01-17 18:25:45'),
(60, 'ziak16', '$argon2id$v=19$m=65536,t=3,p=4$HNVRi/ivD551oAfvaHhOkg$aRT/yaBPbIeFek6e2cqE4X0F/wVyW/XYQH1lwqlk0tA', 'Patrik  ', 'Varga      ', 'patrik.varga@skola.sk', 'student', '2026-01-17 18:26:11'),
(61, 'ziak17', '$argon2id$v=19$m=65536,t=3,p=4$siJOqGyCUCpMVpdzL1WS4Q$En+Jgb9MdlUwtFIIAU1Jn8O71Ps5DMp4M2Is1Jn6c64', 'Matej   ', 'Pavlík     ', 'matej.pavlik@skola.sk', 'student', '2026-01-17 18:26:34'),
(62, 'ziak18', '$argon2id$v=19$m=65536,t=3,p=4$8bEO91Z2L7pM5RE6nGKWIQ$zqpjSV5HQUSL+v6nhml21EE1kAkmOvJiqVXnEECiSJ8', 'Erik    ', 'Kučera     ', 'erik.kucera@skola.sk', 'student', '2026-01-17 18:27:01'),
(63, 'ziak19', '$argon2id$v=19$m=65536,t=3,p=4$tIJzPcEbTuwmIBOw7FpeLw$tdnNBAiHbcN9nqoWuJnJBMFUnsQGzAUbjcw30/o7jvA', 'Roman   ', 'Gajdoš', 'roman.gajdos@skola.sk', 'student', '2026-01-17 18:27:43'),
(64, 'ziak20', '$argon2id$v=19$m=65536,t=3,p=4$+3s53TC+ClBbs7lBaFEPmw$QQdKeJa+LLopTQ8yKMvFOFzR8Qlp+4qK10nw9xsN6po', 'Šimon   ', 'Farkaš     ', 'simon.farkas@skola.sk', 'student', '2026-01-17 18:28:01'),
(65, 'ziak21', '$argon2id$v=19$m=65536,t=3,p=4$7NCgz7cqGWrs2M6Lr9cleQ$xmSP6Fr4GRC89GM7hojaFSqtQzejy7HZZK1X3sc1sG8', 'Viktor    ', 'Mihálik    ', 'viktor.mihalik@skola.sk', 'student', '2026-01-17 18:32:10'),
(66, 'ziak22', '$argon2id$v=19$m=65536,t=3,p=4$MtR5senGYFqjhW/U4BBT1w$znwm7M/8RkhmJBpOsP/I2TY0ahrY7Pa6t6Nko3DAUxg', 'Denis     ', 'Krupa      ', 'denis.krupa@skola.sk', 'student', '2026-01-17 18:32:33'),
(67, 'ziak23', '$argon2id$v=19$m=65536,t=3,p=4$wFapA9YPg2nJAr5hycEG+A$Gck2egTWJUlk6NKzZ9go6qhc7/exYKazocEQ21tTc14', 'Alex      ', 'Lipták     ', 'alex.liptak@skola.sk', 'student', '2026-01-17 18:32:53'),
(68, 'ziak24', '$argon2id$v=19$m=65536,t=3,p=4$xT/O0Zju42ZqXjUCFxklsw$PzErRkhwxWIUoNnFQ5L9w5P86h3VM6KhbwBEWVZeLno', 'Tobias    ', 'Božík      ', 'tobias.bozik@skola.sk', 'student', '2026-01-17 18:33:11'),
(69, 'ziak25', '$argon2id$v=19$m=65536,t=3,p=4$e9gjf5UdXCOyECLEtomrYw$fu7uFUqdpu8bzFWiI1xh78uAQ7moJ5zMF/SvlRxAIaA', 'Richard   ', 'Ondrejka   ', 'richard.ondrejka@skola.sk', 'student', '2026-01-17 18:33:30'),
(70, 'ziak26', '$argon2id$v=19$m=65536,t=3,p=4$SV3JmLurJkAXPXVIuPqisw$I1gz9MGVaGSOQXBjBnBOkytpqPlzB1mMNkjJvQOzozI', 'Sebastián ', 'Ilavský    ', 'sebastian.ilavsky@skola.sk', 'student', '2026-01-17 18:33:48'),
(71, 'ziak27', '$argon2id$v=19$m=65536,t=3,p=4$f7IaDKrfPNRzy+TT/CKbiA$585dFndxxgyrRez919VO+XiBTeXLnjC8+oSjw3n0OyU', 'Matúš     ', 'Švec       ', 'matus.svec@skola.sk', 'student', '2026-01-17 18:34:06'),
(72, 'ziak28', '$argon2id$v=19$m=65536,t=3,p=4$VlN+kPFeWgaeYmHChGs1Cw$YaC0S1mpZGxlB8bepJLF0khEh78nCxSRtvt1/LkWQQU', 'Karol     ', 'Černý      ', 'karol.cerny@skola.sk', 'student', '2026-01-17 18:34:22'),
(73, 'ziak29', '$argon2id$v=19$m=65536,t=3,p=4$7+R8skpwsBIXc01EGKZsiA$AKVusvtwxVbKNerO2kqnKKwF5p3kuV60cHDTrTgI6q4', 'Róbert    ', 'Daniš      ', 'robert.danis@skola.sk', 'student', '2026-01-17 18:34:39'),
(74, 'ziak30', '$argon2id$v=19$m=65536,t=3,p=4$dZ/uF4Qr+vQYXtQ51l2dzQ$Gs38vZdIJgzjoqg2YQCt6ouG76taOonene2a635Shc0', 'Norbert   ', 'Hlinka     ', 'norbert.hlinka@skola.sk', 'student', '2026-01-17 18:34:55'),
(75, 'ucitel01', '$argon2id$v=19$m=65536,t=3,p=4$7cUWyq2eRTZ5V5IUZ4YFxg$g6rEukONT0lYf3QC2ytp7OzBvF2QCEnTSVn14mfGFe8', 'Ján      ', 'Mráz       ', 'jan.mraz@skola.sk', 'teacher', '2026-01-17 18:37:19'),
(76, 'ucitel02', '$argon2id$v=19$m=65536,t=3,p=4$erTp0u5drvKwKM1KGLgLaA$ehBBK+n88ai0M0N40YA3euZK8B1REiSBnyt/SU9mC3k', 'Mária    ', 'Holubová   ', 'maria.holubova@skola.sk', 'teacher', '2026-01-17 18:37:41'),
(77, 'ucitel03', '$argon2id$v=19$m=65536,t=3,p=4$QJoCcD2HtFbHhC/58EnvpA$w/7A3C4T3W6ZCnROVAqGu6RPI+y/uiGwfn3UG/nBip4', 'Peter    ', 'Šimko      ', 'peter.simko@skola.sk', 'teacher', '2026-01-17 18:38:00'),
(78, 'ucitel04', '$argon2id$v=19$m=65536,t=3,p=4$uaoX2FjhAQSXhHmX0LjhuQ$3yYwiLVcPG/z+hXEUi5eQiWt0Tll4OoCSYvFUh07EsY', 'Zuzana   ', 'Kováčová   ', 'zuzana.kovacova@skola.sk', 'teacher', '2026-01-17 18:38:22'),
(79, 'ucitel05', '$argon2id$v=19$m=65536,t=3,p=4$oeThmUHrNbczL6aeg9WNTw$Gfu0CaP6nCU9KEvfD4DzDYBlXzfHu9et67dvlMzslJM', 'Ivan     ', 'Beňo       ', 'ivan.beno@skola.sk', 'teacher', '2026-01-17 18:38:38'),
(80, 'ucitel06', '$argon2id$v=19$m=65536,t=3,p=4$BYOBYytex9WYQeOxleUYKA$uB62xG5hEkEmzRgcGy589FG4Kp6h+vhXz0eS5QyBiCM', 'Katarína ', 'Jurčeková  ', 'katarina.jurcekova@skola.sk', 'teacher', '2026-01-17 18:38:57'),
(81, 'ucitel07', '$argon2id$v=19$m=65536,t=3,p=4$gtef6flml5Yf1hRYNhp8Pg$VVXRiTB4rSuDiq12rUOwa6xjpnTRaKBOR2XXutzVL9A', 'Michal   ', 'Ferenc     ', 'michal.ferenc@skola.sk', 'teacher', '2026-01-17 18:39:13');

--
-- Kľúče pre exportované tabuľky
--

--
-- Indexy pre tabuľku `class`
--
ALTER TABLE `class`
  ADD PRIMARY KEY (`id_class`),
  ADD UNIQUE KEY `year` (`year`,`class1`);

--
-- Indexy pre tabuľku `class_subject`
--
ALTER TABLE `class_subject`
  ADD PRIMARY KEY (`id_class`,`id_subject`),
  ADD KEY `fk_class_subject_subject` (`id_subject`);

--
-- Indexy pre tabuľku `grade`
--
ALTER TABLE `grade`
  ADD PRIMARY KEY (`id_grade`),
  ADD KEY `fk_grade_student` (`id_student`),
  ADD KEY `fk_grade_teacher` (`id_teacher`),
  ADD KEY `fk_grade_class` (`id_class`),
  ADD KEY `fk_grade_subject` (`id_subject`);

--
-- Indexy pre tabuľku `student_class`
--
ALTER TABLE `student_class`
  ADD PRIMARY KEY (`id_student`),
  ADD KEY `fk_student_class_class` (`id_class`);

--
-- Indexy pre tabuľku `subject`
--
ALTER TABLE `subject`
  ADD PRIMARY KEY (`id_subject`),
  ADD UNIQUE KEY `name_subject` (`name_subject`);

--
-- Indexy pre tabuľku `teacher_subject_class`
--
ALTER TABLE `teacher_subject_class`
  ADD PRIMARY KEY (`id_teacher`,`id_class`,`id_subject`),
  ADD KEY `fk_tsc_class` (`id_class`),
  ADD KEY `fk_tsc_subject` (`id_subject`);

--
-- Indexy pre tabuľku `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT pre exportované tabuľky
--

--
-- AUTO_INCREMENT pre tabuľku `class`
--
ALTER TABLE `class`
  MODIFY `id_class` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pre tabuľku `grade`
--
ALTER TABLE `grade`
  MODIFY `id_grade` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT pre tabuľku `subject`
--
ALTER TABLE `subject`
  MODIFY `id_subject` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pre tabuľku `user`
--
ALTER TABLE `user`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- Obmedzenie pre exportované tabuľky
--

--
-- Obmedzenie pre tabuľku `class_subject`
--
ALTER TABLE `class_subject`
  ADD CONSTRAINT `fk_class_subject_class` FOREIGN KEY (`id_class`) REFERENCES `class` (`id_class`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_class_subject_subject` FOREIGN KEY (`id_subject`) REFERENCES `subject` (`id_subject`) ON DELETE CASCADE;

--
-- Obmedzenie pre tabuľku `grade`
--
ALTER TABLE `grade`
  ADD CONSTRAINT `fk_grade_class` FOREIGN KEY (`id_class`) REFERENCES `class` (`id_class`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_grade_student` FOREIGN KEY (`id_student`) REFERENCES `user` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_grade_subject` FOREIGN KEY (`id_subject`) REFERENCES `subject` (`id_subject`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_grade_teacher` FOREIGN KEY (`id_teacher`) REFERENCES `user` (`id_user`) ON DELETE CASCADE;

--
-- Obmedzenie pre tabuľku `student_class`
--
ALTER TABLE `student_class`
  ADD CONSTRAINT `fk_student_class_class` FOREIGN KEY (`id_class`) REFERENCES `class` (`id_class`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_student_class_student` FOREIGN KEY (`id_student`) REFERENCES `user` (`id_user`) ON DELETE CASCADE;

--
-- Obmedzenie pre tabuľku `teacher_subject_class`
--
ALTER TABLE `teacher_subject_class`
  ADD CONSTRAINT `fk_tsc_class` FOREIGN KEY (`id_class`) REFERENCES `class` (`id_class`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tsc_subject` FOREIGN KEY (`id_subject`) REFERENCES `subject` (`id_subject`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tsc_teacher` FOREIGN KEY (`id_teacher`) REFERENCES `user` (`id_user`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
