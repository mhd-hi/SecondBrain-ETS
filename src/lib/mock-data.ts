import { type ParseCourseResponse } from '@/types/api';

export const MOCK_COURSE_DATA: ParseCourseResponse = {
  courseCode: "MAT145",
  term: "20252",
  drafts: [
    {
      week: 1,
      type: "theorie",
      title: "W1 Modélisation et fonctions",
      estimatedEffort: 180,
      suggestedDueDate: "2023-09-01",
      notes: "Commencez par bien comprendre les concepts de base.",
      tags: ["#reading"],
      subtasks: [
        {
          title: "Modélisation et fonctions",
          estimatedEffort: 180,
          notes: "Lisez attentivement le chapitre 1.",
          tags: ["#reading"]
        }
      ]
    },
    {
      week: 2,
      type: "theorie",
      title: "W2 à W4 Dérivation",
      estimatedEffort: 540,
      suggestedDueDate: "2023-09-22",
      notes: "Concentrez-vous sur les règles de dérivation.",
      tags: ["#reading"],
      subtasks: [
        {
          title: "Définition et interprétation géométrique de la dérivée",
          estimatedEffort: 180,
          notes: "Comprendre les concepts de base.",
          tags: ["#reading"]
        },
        {
          title: "Règles de dérivation",
          estimatedEffort: 180,
          notes: "Pratiquez les règles de dérivation.",
          tags: ["#practice"]
        },
        {
          title: "Dérivation en chaîne et implicite",
          estimatedEffort: 180,
          notes: "Faites des exercices sur ces techniques.",
          tags: ["#practice"]
        }
      ]
    },
    {
      week: 5,
      type: "theorie",
      title: "W5 et W6 Utilisation de la dérivée",
      estimatedEffort: 360,
      suggestedDueDate: "2023-09-29",
      notes: "Apprenez les applications de la dérivée.",
      tags: ["#reading"],
      subtasks: [
        {
          title: "Analyse de graphe et optimisation",
          estimatedEffort: 180,
          notes: "Faites des exercices d'optimisation.",
          tags: ["#practice"]
        },
        {
          title: "Méthode de Newton",
          estimatedEffort: 180,
          notes: "Comprendre la méthode de Newton.",
          tags: ["#reading"]
        }
      ]
    },
    {
      week: 7,
      type: "exam",
      title: "W7 Examen intra",
      estimatedEffort: 180,
      suggestedDueDate: "2023-10-06",
      notes: "Préparez-vous bien pour l'examen.",
      tags: ["#exam"],
      subtasks: [
        {
          title: "Révision pour l'examen intra",
          estimatedEffort: 180,
          notes: "Revoyez tous les chapitres précédents.",
          tags: ["#exam"]
        }
      ]
    },
    {
      week: 8,
      type: "theorie",
      title: "W8 Primitives et intégrales",
      estimatedEffort: 180,
      suggestedDueDate: "2023-10-13",
      notes: "Concentrez-vous sur les propriétés des intégrales.",
      tags: ["#reading"],
      subtasks: [
        {
          title: "Primitives et intégrales définies",
          estimatedEffort: 180,
          notes: "Lisez le chapitre 4.",
          tags: ["#reading"]
        }
      ]
    },
    {
      week: 9,
      type: "theorie",
      title: "W9 et W10 Techniques d'intégration",
      estimatedEffort: 360,
      suggestedDueDate: "2023-10-20",
      notes: "Pratiquez les techniques d'intégration.",
      tags: ["#reading"],
      subtasks: [
        {
          title: "Intégration par substitution et par parties",
          estimatedEffort: 180,
          notes: "Faites des exercices sur ces techniques.",
          tags: ["#practice"]
        },
        {
          title: "Intégrales impropres",
          estimatedEffort: 180,
          notes: "Comprendre les intégrales impropres.",
          tags: ["#reading"]
        }
      ]
    },
    {
      week: 11,
      type: "theorie",
      title: "W11 Applications de l'intégrale",
      estimatedEffort: 180,
      suggestedDueDate: "2023-10-27",
      notes: "Apprenez les applications de l'intégrale.",
      tags: ["#reading"],
      subtasks: [
        {
          title: "Aire et volume de solides de révolution",
          estimatedEffort: 180,
          notes: "Lisez le chapitre 5.",
          tags: ["#reading"]
        }
      ]
    },
    {
      week: 12,
      type: "theorie",
      title: "W12 et W13 Développement en série",
      estimatedEffort: 360,
      suggestedDueDate: "2023-11-03",
      notes: "Comprenez les séries de Taylor.",
      tags: ["#reading"],
      subtasks: [
        {
          title: "Séries alternées et intervalle de convergence",
          estimatedEffort: 180,
          notes: "Faites des exercices sur les séries.",
          tags: ["#practice"]
        },
        {
          title: "Utilisation des séries",
          estimatedEffort: 180,
          notes: "Lisez le chapitre 6.",
          tags: ["#reading"]
        }
      ]
    },
    {
      week: 14,
      type: "exam",
      title: "W14 Examen final",
      estimatedEffort: 0,
      suggestedDueDate: "2023-11-10",
      notes: "Préparez-vous pour l'examen final.",
      tags: ["#exam"],
      subtasks: [
        {
          title: "Révision pour l'examen final",
          estimatedEffort: 0,
          notes: "Revoyez tous les chapitres.",
          tags: ["#exam"]
        }
      ]
    }
  ]
};