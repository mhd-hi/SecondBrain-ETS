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
        "notes": "Commencez par les bases de la modélisation et des fonctions.",
        "subtasks": [
          {
            "title": "Introduction à la modélisation",
            "estimatedEffort": 60,
            "notes": "Comprendre les concepts de base."
          },
          {
            "title": "Fonctions et graphes",
            "estimatedEffort": 60,
            "notes": "Étudier les différents types de fonctions."
          },
          {
            "title": "Limites et asymptotes",
            "estimatedEffort": 60,
            "notes": "Apprendre à calculer les limites."
          }
        ]
      },
      {
        "week": 2,
        "type": "theorie",
        "title": "Définition, interprétation géométrique et contexte d’utilisation de la dérivée.",
        "estimatedEffort": 540,
        "notes": "Concentrez-vous sur la dérivée et ses applications.",
        "subtasks": [
          {
            "title": "Définition de la dérivée",
            "estimatedEffort": 180,
            "notes": "Comprendre la définition formelle."
          },
          {
            "title": "Interprétation géométrique",
            "estimatedEffort": 180,
            "notes": "Visualiser la dérivée sur un graphique."
          },
          {
            "title": "Règles de dérivation",
            "estimatedEffort": 180,
            "notes": "Apprendre les règles de base."
          }
        ]
      },
      {
        "week": 5,
        "type": "theorie",
        "title": "Utilisation de la dérivée première et seconde.",
        "estimatedEffort": 360,
        "notes": "Approfondissez l'analyse de la dérivée.",
        "subtasks": [
          {
            "title": "Analyse de graphe",
            "estimatedEffort": 120,
            "notes": "Étudier les variations d'une fonction."
          },
          {
            "title": "Règle de L’Hospital",
            "estimatedEffort": 120,
            "notes": "Apprendre à utiliser cette règle."
          },
          {
            "title": "Optimisation",
            "estimatedEffort": 120,
            "notes": "Résoudre des problèmes d'optimisation."
          }
        ]
      },
      {
        "week": 7,
        "type": "exam",
        "title": "Examen intra",
        "estimatedEffort": 180,
        "notes": "Préparez-vous bien pour l'examen intra."
      },
      {
        "week": 8,
        "type": "theorie",
        "title": "Primitives et intégrales définies.",
        "estimatedEffort": 180,
        "notes": "Concentrez-vous sur les intégrales.",
        "subtasks": [
          {
            "title": "Primitives",
            "estimatedEffort": 60,
            "notes": "Comprendre le concept de primitive."
          },
          {
            "title": "Sommes de Riemann",
            "estimatedEffort": 60,
            "notes": "Apprendre à calculer des sommes de Riemann."
          },
          {
            "title": "Propriétés des intégrales définies",
            "estimatedEffort": 60,
            "notes": "Étudier les propriétés fondamentales."
          }
        ]
      },
      {
        "week": 9,
        "type": "theorie",
        "title": "Théorème fondamental du calcul et techniques d’intégration.",
        "estimatedEffort": 360,
        "notes": "Approfondissez les techniques d'intégration.",
        "subtasks": [
          {
            "title": "Techniques d’intégration",
            "estimatedEffort": 180,
            "notes": "Étudier les différentes techniques."
          },
          {
            "title": "Intégrales impropres",
            "estimatedEffort": 180,
            "notes": "Comprendre les intégrales impropres."
          }
        ]
      },
      {
        "week": 11,
        "type": "theorie",
        "title": "Applications de l’intégrale définie.",
        "estimatedEffort": 180,
        "notes": "Appliquer les intégrales à des problèmes concrets.",
        "subtasks": [
          {
            "title": "Aire et volume",
            "estimatedEffort": 90,
            "notes": "Calculer des aires et volumes."
          },
          {
            "title": "Longueur d’arc",
            "estimatedEffort": 90,
            "notes": "Apprendre à calculer la longueur d'arc."
          }
        ]
      },
      {
        "week": 12,
        "type": "theorie",
        "title": "Développement des fonctions en série de Taylor.",
        "estimatedEffort": 360,
        "notes": "Étudier les séries de Taylor.",
        "subtasks": [
          {
            "title": "Séries alternées",
            "estimatedEffort": 120,
            "notes": "Comprendre les séries alternées."
          },
          {
            "title": "Intervalle de convergence",
            "estimatedEffort": 120,
            "notes": "Apprendre à déterminer l'intervalle."
          },
          {
            "title": "Utilisation des séries",
            "estimatedEffort": 120,
            "notes": "Appliquer les séries à des problèmes."
          }
        ]
      },
      {
        "week": 14,
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
        "week": 1,
        "type": "theorie",
        "title": "Introduction à l’analyse et à la conception par objets et le développement itératif",
        "estimatedEffort": 180,
        "notes": "Commencez par comprendre les concepts de base de l'analyse.",
        "subtasks": [
          {
            "title": "Conception par objets",
            "estimatedEffort": 90,
            "notes": "Familiarisez-vous avec les principes de la conception par objets."
          },
          {
            "title": "Processus unifié",
            "estimatedEffort": 90,
            "notes": "Étudiez les étapes du processus unifié."
          }
        ]
      },
      {
        "week": 2,
        "type": "theorie",
        "title": "Modèles de cas d’utilisation",
        "estimatedEffort": 180,
        "notes": "Concentrez-vous sur les éléments clés des cas d'utilisation.",
        "subtasks": [
          {
            "title": "Éléments d’un cas d’utilisation",
            "estimatedEffort": 90,
            "notes": "Identifiez les composants d'un cas d'utilisation."
          },
          {
            "title": "Cas d’utilisation et les exigences logicielles",
            "estimatedEffort": 90,
            "notes": "Comprenez comment les cas d'utilisation définissent les exigences."
          }
        ]
      },
      {
        "week": 3,
        "type": "theorie",
        "title": "Modèles de domaine",
        "estimatedEffort": 360,
        "notes": "Analysez les modèles de domaine en profondeur.",
        "subtasks": [
          {
            "title": "Analyse du domaine d’application",
            "estimatedEffort": 180,
            "notes": "Examinez les applications pratiques des modèles de domaine."
          },
          {
            "title": "Détermination des classes conceptuelles",
            "estimatedEffort": 180,
            "notes": "Identifiez les classes conceptuelles dans un domaine."
          }
        ]
      },
      {
        "week": 4,
        "type": "theorie",
        "title": "Conception par responsabilités (« Design by contract »)",
        "estimatedEffort": 180,
        "notes": "Apprenez les principes de la conception par responsabilités."
      },
      {
        "week": 5,
        "type": "theorie",
        "title": "Notation UML",
        "estimatedEffort": 360,
        "notes": "Maîtrisez les différents diagrammes UML.",
        "subtasks": [
          {
            "title": "Diagrammes d’interaction",
            "estimatedEffort": 120,
            "notes": "Étudiez les diagrammes d'interaction en UML."
          },
          {
            "title": "Diagrammes d’activité",
            "estimatedEffort": 120,
            "notes": "Comprenez les diagrammes d'activité."
          },
          {
            "title": "Diagrammes d’état",
            "estimatedEffort": 120,
            "notes": "Familiarisez-vous avec les diagrammes d'état."
          }
        ]
      },
      {
        "week": 6,
        "type": "theorie",
        "title": "Modèle de conception suivant les principes GRASP",
        "estimatedEffort": 360,
        "notes": "Explorez les principes GRASP en détail.",
        "subtasks": [
          {
            "title": "Expert en information",
            "estimatedEffort": 45,
            "notes": "Comprenez le rôle de l'expert en information."
          },
          {
            "title": "Créateur",
            "estimatedEffort": 45,
            "notes": "Étudiez le principe du créateur."
          },
          {
            "title": "Contrôleur",
            "estimatedEffort": 45,
            "notes": "Familiarisez-vous avec le principe du contrôleur."
          },
          {
            "title": "Faible couplage",
            "estimatedEffort": 45,
            "notes": "Apprenez l'importance du faible couplage."
          },
          {
            "title": "Forte cohésion",
            "estimatedEffort": 45,
            "notes": "Comprenez le concept de forte cohésion."
          },
          {
            "title": "Polymorphisme",
            "estimatedEffort": 45,
            "notes": "Étudiez le polymorphisme dans la conception."
          },
          {
            "title": "Fabrication pure",
            "estimatedEffort": 45,
            "notes": "Familiarisez-vous avec la fabrication pure."
          },
          {
            "title": "Indirection",
            "estimatedEffort": 45,
            "notes": "Comprenez le principe d'indirection."
          },
          {
            "title": "Protection des variations",
            "estimatedEffort": 45,
            "notes": "Apprenez à protéger les variations dans le design."
          }
        ]
      },
      {
        "week": 7,
        "type": "theorie",
        "title": "Modèle de conception, diagrammes de classes et codage",
        "estimatedEffort": 360,
        "notes": "Concentrez-vous sur la réalisation des cas d'utilisation.",
        "subtasks": [
          {
            "title": "Réalisation de cas d’utilisation",
            "estimatedEffort": 180,
            "notes": "Apprenez à réaliser des cas d'utilisation."
          },
          {
            "title": "Tests unitaires",
            "estimatedEffort": 180,
            "notes": "Familiarisez-vous avec les tests unitaires."
          }
        ]
      },
      {
        "week": 8,
        "type": "theorie",
        "title": "Conception avec les patrons GoF",
        "estimatedEffort": 360,
        "notes": "Explorez les patrons de conception GoF.",
        "subtasks": [
          {
            "title": "Familiarisation avec plusieurs patrons de conception",
            "estimatedEffort": 360,
            "notes": "Étudiez divers patrons de conception et leur utilisation."
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