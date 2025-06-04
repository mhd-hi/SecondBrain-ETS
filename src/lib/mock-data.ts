import { type ParseCourseResponse } from '@/types/api';

const MOCK_COURSES: Record<string, ParseCourseResponse> = {
  MAT145: {
    courseCode: "MAT145",
    term: "20252",
    tasks: [
      {
        "week": 1,
        "type": "theorie",
        "title": "Modélisation. Fonctions. Graphes. Limites et asymptotes.",
        "estimatedEffort": 180,
        "notes": "Commencez par les concepts de base des fonctions et des graphes.",
        "subtasks": [
          {
            "title": "Introduction aux fonctions",
            "estimatedEffort": 90,
            "notes": "Comprendre les types de fonctions."
          },
          {
            "title": "Graphes et limites",
            "estimatedEffort": 90,
            "notes": "Visualiser les fonctions et leurs limites."
          }
        ]
      },
      {
        "week": 2,
        "type": "theorie",
        "title": "Définition, interprétation géométrique et contexte d’utilisation de la dérivée.",
        "estimatedEffort": 540,
        "notes": "Concentrez-vous sur les règles de dérivation et leur application.",
        "subtasks": [
          {
            "title": "Règles de dérivation",
            "estimatedEffort": 180,
            "notes": "Apprenez les règles de base."
          },
          {
            "title": "Dérivation en chaîne",
            "estimatedEffort": 180,
            "notes": "Comprendre la dérivation des fonctions composées."
          },
          {
            "title": "Dérivation implicite",
            "estimatedEffort": 180,
            "notes": "Explorez les dérivées des fonctions implicites."
          }
        ]
      },
      {
        "week": 5,
        "type": "theorie",
        "title": "Utilisation de la dérivée première et seconde.",
        "estimatedEffort": 360,
        "notes": "Analysez les applications des dérivées dans divers contextes.",
        "subtasks": [
          {
            "title": "Analyse de graphe",
            "estimatedEffort": 120,
            "notes": "Interprétez les graphiques des fonctions."
          },
          {
            "title": "Règle de L’Hospital",
            "estimatedEffort": 120,
            "notes": "Utilisez cette règle pour résoudre des limites."
          },
          {
            "title": "Optimisation et méthode de Newton",
            "estimatedEffort": 120,
            "notes": "Apprenez à optimiser des fonctions."
          }
        ]
      },
      {
        "week": 7,
        "type": "exam",
        "title": "Examen intra",
        "estimatedEffort": 180,
        "notes": "Préparez-vous pour l'examen avec des révisions.",
        "subtasks": [
          {
            "title": "Révisions pour l'examen",
            "estimatedEffort": 180,
            "notes": "Concentrez-vous sur les sujets clés."
          }
        ]
      },
      {
        "week": 8,
        "type": "theorie",
        "title": "Primitives et intégrales définies.",
        "estimatedEffort": 180,
        "notes": "Comprendre les concepts d'intégration.",
        "subtasks": [
          {
            "title": "Sommes de Riemann",
            "estimatedEffort": 90,
            "notes": "Apprenez à calculer les sommes de Riemann."
          },
          {
            "title": "Propriétés des intégrales définies",
            "estimatedEffort": 90,
            "notes": "Explorez les propriétés fondamentales."
          }
        ]
      },
      {
        "week": 9,
        "type": "theorie",
        "title": "Théorème fondamental du calcul et techniques d’intégration.",
        "estimatedEffort": 360,
        "notes": "Maîtrisez les techniques d'intégration avancées.",
        "subtasks": [
          {
            "title": "Intégration par substitution",
            "estimatedEffort": 90,
            "notes": "Apprenez cette technique essentielle."
          },
          {
            "title": "Intégration par parties",
            "estimatedEffort": 90,
            "notes": "Comprendre cette méthode."
          },
          {
            "title": "Utilisation de tables d’intégrales",
            "estimatedEffort": 90,
            "notes": "Utilisez des tables pour simplifier les calculs."
          },
          {
            "title": "Intégrales impropres",
            "estimatedEffort": 90,
            "notes": "Explorez les intégrales qui ne sont pas définies."
          }
        ]
      },
      {
        "week": 11,
        "type": "theorie",
        "title": "Applications de l’intégrale définie.",
        "estimatedEffort": 180,
        "notes": "Apprenez à appliquer les intégrales dans des contextes pratiques.",
        "subtasks": [
          {
            "title": "Aire et volume de solides de révolution",
            "estimatedEffort": 90,
            "notes": "Comprendre les applications géométriques."
          },
          {
            "title": "Longueur d’arc",
            "estimatedEffort": 90,
            "notes": "Calculez la longueur d'arc des courbes."
          }
        ]
      },
      {
        "week": 12,
        "type": "theorie",
        "title": "Développement des fonctions en série de Taylor.",
        "estimatedEffort": 360,
        "notes": "Explorez les séries et leur convergence.",
        "subtasks": [
          {
            "title": "Séries alternées",
            "estimatedEffort": 90,
            "notes": "Comprendre les séries alternées."
          },
          {
            "title": "Intervalle de convergence",
            "estimatedEffort": 90,
            "notes": "Déterminez où les séries convergent."
          },
          {
            "title": "Utilisation des séries",
            "estimatedEffort": 90,
            "notes": "Apprenez à utiliser les séries dans des problèmes."
          },
          {
            "title": "Séries géométriques",
            "estimatedEffort": 90,
            "notes": "Explorez les propriétés des séries géométriques."
          }
        ]
      },
      {
        "week": 0,
        "type": "exam",
        "title": "Examen final",
        "estimatedEffort": 0,
        "notes": "Préparez-vous pour l'examen final."
      }
    ]
  },
  LOG210: {
    courseCode: "LOG210",
    term: "20252",
    tasks: [
      {
        week: 1,
        type: "theorie",
        title: "W1 Introduction à l'analyse et à la conception par objets et le développement itératif",
        estimatedEffort: 180,
        notes: "Commencez par comprendre les concepts de base de la conception par objets.",
        subtasks: [
          {
            title: "Conception par objets",
            estimatedEffort: 60,
            notes: "Familiarisez-vous avec les principes de la conception par objets."
          },
          {
            title: "Processus unifié",
            estimatedEffort: 120,
            notes: "Étudiez les étapes du processus unifié."
          }
        ]
      },
      {
        week: 1,
        type: "theorie",
        title: "W1 Modèles de cas d'utilisation",
        estimatedEffort: 180,
        notes: "Analysez les éléments clés d'un cas d'utilisation.",
        subtasks: [
          {
            title: "Éléments d'un cas d'utilisation",
            estimatedEffort: 90,
            notes: "Identifiez les composants d'un cas d'utilisation."
          },
          {
            title: "Cas d'utilisation et les exigences logicielles",
            estimatedEffort: 90,
            notes: "Comprenez comment les cas d'utilisation définissent les exigences."
          }
        ]
      },
      {
        week: 1,
        type: "theorie",
        title: "W1 Modèles de domaine",
        estimatedEffort: 360,
        notes: "Explorez l'analyse du domaine d'application.",
        subtasks: [
          {
            title: "Analyse du domaine d'application",
            estimatedEffort: 180,
            notes: "Étudiez les méthodes d'analyse du domaine."
          },
          {
            title: "Détermination des classes conceptuelles",
            estimatedEffort: 180,
            notes: "Identifiez les classes conceptuelles dans un domaine."
          }
        ]
      },
      {
        week: 1,
        type: "theorie",
        title: "W1 Conception par responsabilités (« Design by contract »)",
        estimatedEffort: 180,
        notes: "Comprenez le concept de design par contrat.",
        subtasks: [
          {
            title: "Design by contract",
            estimatedEffort: 180,
            notes: "Étudiez les principes du design par contrat."
          }
        ]
      },
      {
        week: 1,
        type: "theorie",
        title: "W1 Notation UML",
        estimatedEffort: 360,
        notes: "Familiarisez-vous avec les différents diagrammes UML.",
        subtasks: [
          {
            title: "Diagrammes d'interaction",
            estimatedEffort: 120,
            notes: "Étudiez les diagrammes d'interaction en UML."
          },
          {
            title: "Diagrammes d'activité",
            estimatedEffort: 120,
            notes: "Comprenez les diagrammes d'activité en UML."
          },
          {
            title: "Diagrammes d'état",
            estimatedEffort: 120,
            notes: "Analysez les diagrammes d'état en UML."
          }
        ]
      },
      {
        week: 1,
        type: "theorie",
        title: "W1 Modèle de conception suivant les principes GRASP",
        estimatedEffort: 360,
        notes: "Explorez les principes GRASP en conception.",
        subtasks: [
          {
            title: "Expert en information",
            estimatedEffort: 45,
            notes: "Comprenez le rôle de l'expert en information."
          },
          {
            title: "Créateur",
            estimatedEffort: 45,
            notes: "Étudiez le principe du créateur."
          },
          {
            title: "Contrôleur",
            estimatedEffort: 45,
            notes: "Analysez le principe du contrôleur."
          },
          {
            title: "Faible couplage",
            estimatedEffort: 45,
            notes: "Comprenez l'importance du faible couplage."
          },
          {
            title: "Forte cohésion",
            estimatedEffort: 45,
            notes: "Étudiez le principe de forte cohésion."
          },
          {
            title: "Polymorphisme",
            estimatedEffort: 45,
            notes: "Analysez le concept de polymorphisme."
          },
          {
            title: "Fabrication pure",
            estimatedEffort: 45,
            notes: "Comprenez le principe de fabrication pure."
          },
          {
            title: "Indirection",
            estimatedEffort: 45,
            notes: "Étudiez le principe d'indirection."
          },
          {
            title: "Protection des variations",
            estimatedEffort: 45,
            notes: "Analysez le principe de protection des variations."
          }
        ]
      },
      {
        week: 1,
        type: "theorie",
        title: "W1 Modèle de conception, diagrammes de classes et codage",
        estimatedEffort: 360,
        notes: "Familiarisez-vous avec les diagrammes de classes.",
        subtasks: [
          {
            title: "Réalisation de cas d'utilisation",
            estimatedEffort: 180,
            notes: "Étudiez la réalisation des cas d'utilisation."
          },
          {
            title: "Tests unitaires",
            estimatedEffort: 180,
            notes: "Comprenez l'importance des tests unitaires."
          }
        ]
      },
      {
        week: 1,
        type: "theorie",
        title: "W1 Conception avec les patrons GoF",
        estimatedEffort: 360,
        notes: "Familiarisez-vous avec les patrons de conception.",
        subtasks: [
          {
            title: "Familiarisation avec plusieurs patrons de conception",
            estimatedEffort: 360,
            notes: "Étudiez divers patrons de conception et leur utilisation."
          }
        ]
      }
    ]
  }
};

// Current mock course to use
let currentMockCourse = 'LOG210';

export function setMockCourse(courseCode: string) {
  if (courseCode in MOCK_COURSES) {
    currentMockCourse = courseCode;
  } else {
    console.warn(`Course ${courseCode} not found in mock data. Available courses: ${Object.keys(MOCK_COURSES).join(', ')}`);
  }
}

// We know this is safe because currentMockCourse is always set to a valid key
export const MOCK_COURSE_DATA = MOCK_COURSES[currentMockCourse];