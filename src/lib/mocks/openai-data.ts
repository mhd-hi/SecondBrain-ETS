import type { CourseAIResponse } from '@/types/api';

export const MOCK_COURSES: Record<string, CourseAIResponse> = {
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
  },
  LOG320: {
    courseCode: "LOG320",
    term: "20252",
    tasks: [
      {
        "week": 1,
        "type": "theorie",
        "title": "Introduction au cours et analyse asymptotique",
        "estimatedEffort": 210,
        "notes": "Commencez par bien comprendre les algorithmes de tri.",
        "subtasks": [
          {
            "title": "Introduction au cours",
            "estimatedEffort": 30,
            "notes": "Familiarisez-vous avec le contenu du cours."
          },
          {
            "title": "Analyse asymptotique : grand oh, grand omega et grand theta",
            "estimatedEffort": 60,
            "notes": "Concentrez-vous sur les notations asymptotiques."
          },
          {
            "title": "Algorithmes de tri",
            "estimatedEffort": 120,
            "notes": "Étudiez les différents algorithmes de tri."
          }
        ]
      },
      {
        "week": 2,
        "type": "theorie",
        "title": "Algorithmes récursifs et analyse asymptotique",
        "estimatedEffort": 240,
        "notes": "La récursion est essentielle pour comprendre les algorithmes.",
        "subtasks": [
          {
            "title": "Algorithme récursif",
            "estimatedEffort": 120,
            "notes": "Revoyez les concepts de récursion."
          },
          {
            "title": "Analyse asymptotique",
            "estimatedEffort": 120,
            "notes": "Apprenez les méthodes d'analyse asymptotique."
          }
        ]
      },
      {
        "week": 3,
        "type": "theorie",
        "title": "Arbres de jeu et structures de données de base",
        "estimatedEffort": 240,
        "notes": "Les arbres de jeu sont cruciaux pour les algorithmes.",
        "subtasks": [
          {
            "title": "Arbres de jeu",
            "estimatedEffort": 120,
            "notes": "Comprenez les algorithmes Minimax et alpha-beta."
          },
          {
            "title": "Structures de données de base",
            "estimatedEffort": 120,
            "notes": "Familiarisez-vous avec les piles, files et listes."
          }
        ]
      },
      {
        "week": 4,
        "type": "theorie",
        "title": "Arbres binaires et arbres rouge-noir",
        "estimatedEffort": 240,
        "notes": "Les opérations sur les arbres sont fondamentales.",
        "subtasks": [
          {
            "title": "Arbre binaire de recherche",
            "estimatedEffort": 120,
            "notes": "Étudiez les opérations de base sur les arbres."
          },
          {
            "title": "Arbre rouge-noir",
            "estimatedEffort": 120,
            "notes": "Comprenez les rotations et insertions."
          }
        ]
      },
      {
        "week": 5,
        "type": "theorie",
        "title": "Arbre rouge-noir et table de hachage",
        "estimatedEffort": 180,
        "notes": "Consolidez vos connaissances sur les arbres.",
        "subtasks": [
          {
            "title": "Arbre rouge-noir (suite)",
            "estimatedEffort": 90,
            "notes": "Revoyez la suppression et l'augmentation de structure."
          },
          {
            "title": "Table de hachage",
            "estimatedEffort": 90,
            "notes": "Comprenez le fonctionnement des tables de hachage."
          }
        ]
      },
      {
        "week": 6,
        "type": "theorie",
        "title": "Graphes et exercices pour l'examen intra",
        "estimatedEffort": 240,
        "notes": "Les graphes sont un sujet clé en algorithmique.",
        "subtasks": [
          {
            "title": "Graphes",
            "estimatedEffort": 150,
            "notes": "Étudiez les recherches en largeur et profondeur."
          },
          {
            "title": "Exercices pour l'examen intra",
            "estimatedEffort": 90,
            "notes": "Préparez-vous pour l'examen intra."
          }
        ]
      },
      {
        "week": 7,
        "type": "exam",
        "title": "Examen intra",
        "estimatedEffort": 210,
        "notes": "Préparez-vous bien pour l'examen.",
        "subtasks": [
          {
            "title": "Examen intra",
            "estimatedEffort": 210,
            "notes": "Assurez-vous de bien réviser tous les sujets."
          }
        ]
      },
      {
        "week": 8,
        "type": "theorie",
        "title": "Optimisation combinatoire et algorithmes gloutons",
        "estimatedEffort": 240,
        "notes": "L'optimisation est un sujet complexe mais important.",
        "subtasks": [
          {
            "title": "Introduction à l'optimisation combinatoire",
            "estimatedEffort": 60,
            "notes": "Comprenez le concept de NP-Complet."
          },
          {
            "title": "Algorithmes gloutons",
            "estimatedEffort": 180,
            "notes": "Étudiez les algorithmes comme Dijkstra et A*."
          }
        ]
      },
      {
        "week": 9,
        "type": "theorie",
        "title": "Programmation dynamique",
        "estimatedEffort": 180,
        "notes": "La programmation dynamique est essentielle pour résoudre des problèmes complexes.",
        "subtasks": [
          {
            "title": "Programmation dynamique",
            "estimatedEffort": 180,
            "notes": "Familiarisez-vous avec les concepts de mémoïsation."
          }
        ]
      },
      {
        "week": 10,
        "type": "theorie",
        "title": "Programmation dynamique - Exemples pratiques",
        "estimatedEffort": 90,
        "notes": "Mettez en pratique vos connaissances en classe.",
        "subtasks": [
          {
            "title": "Exemples pratiques en classe",
            "estimatedEffort": 90,
            "notes": "Participez activement aux exercices."
          }
        ]
      },
      {
        "week": 11,
        "type": "theorie",
        "title": "Branch and bound et introduction à l'IA",
        "estimatedEffort": 240,
        "notes": "Ces concepts sont cruciaux pour l'IA.",
        "subtasks": [
          {
            "title": "Branch and bound",
            "estimatedEffort": 120,
            "notes": "Comprenez les bases de cette méthode."
          },
          {
            "title": "Introduction à l'IA",
            "estimatedEffort": 120,
            "notes": "Familiarisez-vous avec K-means et les réseaux de neurones."
          }
        ]
      },
      {
        "week": 12,
        "type": "theorie",
        "title": "Recherche dans les chaînes de caractères",
        "estimatedEffort": 240,
        "notes": "Les algorithmes de recherche sont fondamentaux.",
        "subtasks": [
          {
            "title": "Algorithme naïf",
            "estimatedEffort": 60,
            "notes": "Comprenez le fonctionnement de l'algorithme."
          },
          {
            "title": "Algorithme Boyer-Moore",
            "estimatedEffort": 60,
            "notes": "Étudiez les avantages de cet algorithme."
          },
          {
            "title": "Algorithme Knuth-Morris-Pratt",
            "estimatedEffort": 60,
            "notes": "Familiarisez-vous avec cet algorithme efficace."
          },
          {
            "title": "Distance de Leivenstein",
            "estimatedEffort": 60,
            "notes": "Comprenez l'importance de cette distance."
          }
        ]
      },
      {
        "week": 13,
        "type": "homework",
        "title": "Exercices pour l'examen final",
        "estimatedEffort": 90,
        "notes": "Préparez-vous pour l'examen final.",
        "subtasks": [
          {
            "title": "Exercices pour l'examen final",
            "estimatedEffort": 90,
            "notes": "Consolidez vos connaissances avec des exercices."
          }
        ]
      }
    ]
  },
  PHY144: {
    courseCode: "PHY144",
    term: "20252",
    tasks: [
      {
        "week": 1,
        "type": "theorie",
        "title": "Dimensions, unités et algèbre vectorielle",
        "estimatedEffort": 180,
        "notes": "Introduction aux concepts fondamentaux de la physique.",
        "subtasks": []
      },
      {
        "week": 2,
        "type": "theorie",
        "title": "Notion de force",
        "estimatedEffort": 180,
        "notes": "Comprendre les bases de la force et de l'équilibre.",
        "subtasks": [
          {
            "title": "Équilibre de translation",
            "estimatedEffort": 180,
            "notes": "Étudier les conditions d'équilibre en translation."
          }
        ]
      },
      {
        "week": 3,
        "type": "theorie",
        "title": "Notion de moment de force",
        "estimatedEffort": 180,
        "notes": "Explorer le concept de moment de force.",
        "subtasks": [
          {
            "title": "Équilibre de rotation",
            "estimatedEffort": 180,
            "notes": "Analyser l'équilibre en rotation."
          }
        ]
      },
      {
        "week": 4,
        "type": "theorie",
        "title": "Équilibre d’un corps rigide",
        "estimatedEffort": 180,
        "notes": "Étudier l'équilibre des corps rigides.",
        "subtasks": [
          {
            "title": "Translation et rotation",
            "estimatedEffort": 180,
            "notes": "Comprendre la relation entre translation et rotation."
          }
        ]
      },
      {
        "week": 5,
        "type": "exam",
        "title": "EXAMEN N° 1",
        "estimatedEffort": 0,
        "notes": "Préparez-vous pour le premier examen.",
        "subtasks": []
      },
      {
        "week": 5,
        "type": "theorie",
        "title": "Cinématique : Translation",
        "estimatedEffort": 180,
        "notes": "Introduction à la cinématique de translation.",
        "subtasks": [
          {
            "title": "Définition des paramètres",
            "estimatedEffort": 60,
            "notes": "Comprendre les paramètres de la cinématique."
          },
          {
            "title": "Équations du mouvement : MRUA",
            "estimatedEffort": 60,
            "notes": "Étudier les équations du mouvement uniformément accéléré."
          },
          {
            "title": "Chute libre",
            "estimatedEffort": 60,
            "notes": "Analyser le mouvement de chute libre."
          }
        ]
      },
      {
        "week": 6,
        "type": "theorie",
        "title": "Cinématique : Projectile",
        "estimatedEffort": 180,
        "notes": "Étudier le mouvement des projectiles.",
        "subtasks": [
          {
            "title": "Mouvement balistique",
            "estimatedEffort": 180,
            "notes": "Comprendre le mouvement balistique."
          }
        ]
      },
      {
        "week": 7,
        "type": "theorie",
        "title": "Cinématique : Rotation",
        "estimatedEffort": 360,
        "notes": "Explorer la cinématique de rotation.",
        "subtasks": [
          {
            "title": "Définition des paramètres",
            "estimatedEffort": 120,
            "notes": "Comprendre les paramètres de la rotation."
          },
          {
            "title": "Équations du mouvement : MCUA",
            "estimatedEffort": 120,
            "notes": "Étudier les équations du mouvement circulaire uniformément accéléré."
          },
          {
            "title": "Relations entre paramètres linéaires et angulaires",
            "estimatedEffort": 120,
            "notes": "Analyser les relations entre les mouvements linéaires et angulaires."
          }
        ]
      },
      {
        "week": 8,
        "type": "exam",
        "title": "EXAMEN N° 2",
        "estimatedEffort": 0,
        "notes": "Préparez-vous pour le deuxième examen.",
        "subtasks": []
      },
      {
        "week": 9,
        "type": "theorie",
        "title": "Dynamique",
        "estimatedEffort": 180,
        "notes": "Introduction à la dynamique.",
        "subtasks": [
          {
            "title": "Lois de Newton",
            "estimatedEffort": 90,
            "notes": "Étudier les lois fondamentales de Newton."
          },
          {
            "title": "Mouvements de translation sans et avec frottement",
            "estimatedEffort": 90,
            "notes": "Analyser les mouvements avec et sans frottement."
          }
        ]
      },
      {
        "week": 10,
        "type": "theorie",
        "title": "Dynamique : Frottement",
        "estimatedEffort": 180,
        "notes": "Explorer le frottement dans le mouvement curviligne.",
        "subtasks": [
          {
            "title": "Mouvement curviligne",
            "estimatedEffort": 180,
            "notes": "Comprendre le mouvement curviligne avec frottement."
          }
        ]
      },
      {
        "week": 11,
        "type": "theorie",
        "title": "Travail, énergie, puissance",
        "estimatedEffort": 180,
        "notes": "Étudier les concepts de travail, énergie et puissance.",
        "subtasks": []
      },
      {
        "week": 12,
        "type": "theorie",
        "title": "Conservation de l’énergie",
        "estimatedEffort": 180,
        "notes": "Comprendre le principe de conservation de l'énergie.",
        "subtasks": []
      },
      {
        "week": 13,
        "type": "theorie",
        "title": "Synthèse et/ou activité",
        "estimatedEffort": 180,
        "notes": "Activité de synthèse des connaissances acquises.",
        "subtasks": []
      },
      {
        "week": 13,
        "type": "exam",
        "title": "EXAMEN FINAL",
        "estimatedEffort": 0,
        "notes": "Préparez-vous pour l'examen final.",
        "subtasks": []
      }
    ]
  },
  MAT350: {
    courseCode: "MAT350",
    term: "20252",
    tasks: [

      {
        "week": 1,
        "type": "theorie",
        "title": "Statistiques descriptives et présentation graphique",
        "estimatedEffort": 6,
        "notes": "Comprendre les mesures sur des échantillons.",
        "subtasks": [
          {
            "title": "Statistiques descriptives",
            "estimatedEffort": 3,
            "notes": "Focus sur moyenne, écart-type, médiane."
          },
          {
            "title": "Tableaux et présentation graphique",
            "estimatedEffort": 3,
            "notes": "Utiliser des graphiques pour la présentation."
          }
        ]
      },
      {
        "week": 3,
        "type": "theorie",
        "title": "Probabilités et variables aléatoires",
        "estimatedEffort": 6,
        "notes": "Maîtriser les concepts de probabilité.",
        "subtasks": [
          {
            "title": "Axiomes et propriétés des probabilités",
            "estimatedEffort": 3,
            "notes": "Comprendre les bases des probabilités."
          },
          {
            "title": "Variables aléatoires et distributions",
            "estimatedEffort": 3,
            "notes": "Étudier les modèles discrets et continus."
          }
        ]
      },
      {
        "week": 5,
        "type": "theorie",
        "title": "Modèles continus",
        "estimatedEffort": 3,
        "notes": "Explorer les lois de probabilité continues.",
        "subtasks": [
          {
            "title": "Lois uniforme et exponentielle",
            "estimatedEffort": 1.5,
            "notes": "Comprendre les applications de ces lois."
          },
          {
            "title": "Lois Student et normale",
            "estimatedEffort": 1.5,
            "notes": "Analyser les caractéristiques de ces lois."
          }
        ]
      },
      {
        "week": 6,
        "type": "theorie",
        "title": "Applications de la loi normale",
        "estimatedEffort": 3,
        "notes": "Appliquer le théorème central limite.",
        "subtasks": [
          {
            "title": "Théorème central limite",
            "estimatedEffort": 1.5,
            "notes": "Comprendre son importance en statistiques."
          },
          {
            "title": "Normalité d’une distribution",
            "estimatedEffort": 1.5,
            "notes": "Évaluer la normalité des données."
          }
        ]
      },
      {
        "week": 7,
        "type": "exam",
        "title": "Examen intra",
        "estimatedEffort": 3,
        "notes": "Préparer l'examen intra.",
        "subtasks": [
          {
            "title": "Révision pour l'examen",
            "estimatedEffort": 3,
            "notes": "Consolider les connaissances acquises."
          }
        ]
      },
      {
        "week": 8,
        "type": "theorie",
        "title": "Estimation d’une moyenne",
        "estimatedEffort": 3,
        "notes": "Apprendre à estimer des moyennes.",
        "subtasks": [
          {
            "title": "Intervalle de confiance",
            "estimatedEffort": 1.5,
            "notes": "Comprendre les intervalles de confiance."
          },
          {
            "title": "Estimation d’une proportion",
            "estimatedEffort": 1.5,
            "notes": "Appliquer les concepts d'estimation."
          }
        ]
      },
      {
        "week": 9,
        "type": "theorie",
        "title": "Tests d’hypothèses",
        "estimatedEffort": 3,
        "notes": "Maîtriser les tests d’hypothèses.",
        "subtasks": [
          {
            "title": "Tests sur moyenne",
            "estimatedEffort": 1.5,
            "notes": "Comprendre les tests d'hypothèses."
          },
          {
            "title": "Seuil descriptif",
            "estimatedEffort": 1.5,
            "notes": "Analyser la valeur-p."
          }
        ]
      },
      {
        "week": 10,
        "type": "theorie",
        "title": "Risques d’erreurs",
        "estimatedEffort": 3,
        "notes": "Évaluer les risques d'erreurs.",
        "subtasks": [
          {
            "title": "Risques 1ère et 2ème espèces",
            "estimatedEffort": 1.5,
            "notes": "Comprendre les types d'erreurs."
          },
          {
            "title": "Taille d’échantillon",
            "estimatedEffort": 1.5,
            "notes": "Calculer la taille d'échantillon nécessaire."
          }
        ]
      },
      {
        "week": 11,
        "type": "theorie",
        "title": "Tests d’hypothèses sur 2 paramètres",
        "estimatedEffort": 3,
        "notes": "Analyser l'égalité de paramètres.",
        "subtasks": [
          {
            "title": "Tests d’égalité de paramètres",
            "estimatedEffort": 3,
            "notes": "Approfondir les tests d'hypothèses."
          }
        ]
      },
      {
        "week": 12,
        "type": "theorie",
        "title": "Régression linéaire et analyse de variance",
        "estimatedEffort": 6,
        "notes": "Comprendre la régression et l'analyse de variance.",
        "subtasks": [
          {
            "title": "Régression linéaire simple",
            "estimatedEffort": 3,
            "notes": "Étudier la droite de régression."
          },
          {
            "title": "Analyse de variance",
            "estimatedEffort": 3,
            "notes": "Analyser les résidus et la variance."
          }
        ]
      }

    ]
  },
};
