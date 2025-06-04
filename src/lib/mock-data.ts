import { type ParseCourseResponse } from '@/types/api';

const MOCK_COURSES: Record<string, ParseCourseResponse> = {
  MAT145: {
    courseCode: "MAT145",
    term: "20252",
    drafts: [
      {
        "week": 1,
        "type": "theorie",
        "title": "Modélisation. Fonctions. Graphes. Limites et asymptotes.",
        "estimatedEffort": 180,
        "notes": "Commencez par bien comprendre les concepts de base."
      },
      {
        "week": 2,
        "type": "theorie",
        "title": "Définition, interprétation géométrique et contexte d’utilisation de la dérivée.",
        "estimatedEffort": 540,
        "notes": "Concentrez-vous sur les règles de dérivation."
      },
      {
        "week": 3,
        "type": "theorie",
        "title": "Règles de dérivation. Dérivation en chaîne. Dérivation implicite.",
        "estimatedEffort": 540,
        "notes": "Pratiquez avec des exemples variés."
      },
      {
        "week": 5,
        "type": "theorie",
        "title": "Utilisation de la dérivée première et seconde.",
        "estimatedEffort": 360,
        "notes": "Analysez les graphes pour mieux comprendre."
      },
      {
        "week": 7,
        "type": "exam",
        "title": "Examen intra",
        "estimatedEffort": 180,
        "notes": "Révisez tous les chapitres précédents."
      },
      {
        "week": 8,
        "type": "theorie",
        "title": "Primitives. Sommes de Riemann. Intégrale définie.",
        "estimatedEffort": 180,
        "notes": "Familiarisez-vous avec les propriétés des intégrales."
      },
      {
        "week": 9,
        "type": "theorie",
        "title": "Théorème fondamental du calcul. Techniques d’intégration.",
        "estimatedEffort": 360,
        "notes": "Pratiquez les différentes techniques d’intégration."
      },
      {
        "week": 11,
        "type": "theorie",
        "title": "Applications de l’intégrale définie.",
        "estimatedEffort": 180,
        "notes": "Comprenez les applications pratiques des intégrales."
      },
      {
        "week": 12,
        "type": "theorie",
        "title": "Développement des fonctions en série de Taylor.",
        "estimatedEffort": 360,
        "notes": "Étudiez les séries alternées et leur convergence."
      },
      {
        "week": 13,
        "type": "exam",
        "title": "Examen final",
        "estimatedEffort": 0,
        "notes": "Préparez-vous bien pour l'examen final."
      }
    ]
  },
  LOG210: {
    courseCode: "LOG210",
    term: "20252",
    drafts: [
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