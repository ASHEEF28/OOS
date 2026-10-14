import { SkillChallenge } from '../types';

export const SEED_CHALLENGES: SkillChallenge[] = [
  {
    id: 'challenge-py-telemetry',
    title: 'Clean & Aggregate Sensor Telemetry',
    description: 'Filter missing/corrupt sensor readings, compute statistics per device, and return structured telemetry summaries.',
    skill_id: 'skill-python',
    skill_name: 'Python',
    difficulty: 'beginner',
    estimated_minutes: 15,
    instructions: `### Objective
Write a function \`aggregate_sensor_data(readings)\` that processes an array of sensor objects and returns aggregate metrics per sensor.

### Rules
1. Each reading is an object with: \`{ "sensor_id": string, "value": number | null, "timestamp": number }\`
2. Discard readings where \`value\` is \`null\`, \`undefined\`, or less than \`0\` (invalid measurement).
3. If a sensor has no valid readings, do not include it in the output.
4. Calculate \`count\`, \`average\` (rounded to 2 decimal places), and \`max\` value for each valid sensor.
5. Return an object where keys are the \`sensor_id\` and values are: \`{ "count": number, "average": number, "max": number }\`.
`,
    starter_code: `def aggregate_sensor_data(readings):
    # Your implementation here
    # Example item: {"sensor_id": "temp-1", "value": 24.5, "timestamp": 1728000}
    summary = {}
    
    for r in readings:
        pass
        
    return summary
`,
    evaluation_type: 'code_tests',
    test_cases: [
      {
        id: 'tc-1',
        description: 'Standard readings across multiple sensors',
        input: [
          { sensor_id: 'temp-1', value: 20, timestamp: 1 },
          { sensor_id: 'temp-1', value: 30, timestamp: 2 },
          { sensor_id: 'press-2', value: 100, timestamp: 3 },
          { sensor_id: 'press-2', value: 120, timestamp: 4 },
        ],
        expected: {
          'temp-1': { count: 2, average: 25, max: 30 },
          'press-2': { count: 2, average: 110, max: 120 },
        }
      },
      {
        id: 'tc-2',
        description: 'Filter invalid, null, and negative values',
        input: [
          { sensor_id: 'temp-1', value: null, timestamp: 1 },
          { sensor_id: 'temp-1', value: -5, timestamp: 2 },
          { sensor_id: 'temp-1', value: 22.4, timestamp: 3 },
          { sensor_id: 'bad-sensor', value: -10, timestamp: 4 },
        ],
        expected: {
          'temp-1': { count: 1, average: 22.4, max: 22.4 },
        }
      },
      {
        id: 'tc-3',
        description: 'Empty list handles cleanly without crash',
        input: [],
        expected: {}
      }
    ],
    is_active: true
  },
  {
    id: 'challenge-js-queue',
    title: 'Concurrent Task Worker with Batching',
    description: 'Implement a promise pool that executes async tasks concurrently up to a concurrency limit while maintaining order.',
    skill_id: 'skill-javascript',
    skill_name: 'JavaScript',
    difficulty: 'intermediate',
    estimated_minutes: 20,
    instructions: `### Objective
Implement \`async function runWithConcurrency(tasks, limit)\` that executes an array of asynchronous task functions (functions returning promises) with at most \`limit\` running at any given time.

### Requirements:
1. Maintain the original index order of results.
2. Never exceed \`limit\` active asynchronous tasks.
3. If \`tasks\` is empty, resolve with an empty array \`[]\`.
4. Return an array of all resolved task results.
`,
    starter_code: `async function runWithConcurrency(tasks, limit) {
  // tasks: Array<() => Promise<any>>
  // limit: number
  const results = new Array(tasks.length);
  // Write your concurrent execution loop here
  
  return results;
}
`,
    evaluation_type: 'code_tests',
    test_cases: [
      {
        id: 'tc-js-1',
        description: 'Executes 4 simple tasks preserving order with limit 2',
        input: { count: 4, limit: 2 },
        expected: [0, 1, 2, 3]
      },
      {
        id: 'tc-js-2',
        description: 'Handles empty task array safely',
        input: { count: 0, limit: 3 },
        expected: []
      },
      {
        id: 'tc-js-3',
        description: 'Single concurrency limit works sequentially',
        input: { count: 3, limit: 1 },
        expected: [0, 1, 2]
      }
    ],
    is_active: true
  },
  {
    id: 'challenge-sql-cohort',
    title: 'SQL: Active Student Enrollment Retention',
    description: 'Write an analytical SQL query to find courses with more than 2 active students and calculate their completion percentage.',
    skill_id: 'skill-sql',
    skill_name: 'SQL',
    difficulty: 'beginner',
    estimated_minutes: 15,
    instructions: `### Objective
Write an SQL query against the \`enrollments\` table to retrieve all courses that have at least 2 students, and compute their completion rate.

### Table Schema: \`enrollments\`
- \`id\`: INTEGER
- \`student_id\`: INTEGER
- \`course_code\`: VARCHAR
- \`status\`: VARCHAR ('completed', 'in_progress', 'dropped')

### Required Columns:
- \`course_code\`
- \`total_students\`: COUNT of total enrollments in the course
- \`completed_count\`: COUNT of enrollments with status = 'completed'

### Grouping and Ordering:
- Group by \`course_code\`
- Filter with \`HAVING COUNT(*) >= 2\`
- Order by \`total_students DESC, course_code ASC\`
`,
    starter_code: `SELECT 
    course_code,
    COUNT(*) AS total_students,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_count
FROM enrollments
GROUP BY course_code
HAVING COUNT(*) >= 2
ORDER BY total_students DESC, course_code ASC;`,
    evaluation_type: 'sql_query',
    test_cases: [
      {
        id: 'tc-sql-1',
        description: 'Calculates total and completed enrollments correctly for qualified courses',
        input: [
          { id: 1, student_id: 101, course_code: 'CS101', status: 'completed' },
          { id: 2, student_id: 102, course_code: 'CS101', status: 'completed' },
          { id: 3, student_id: 103, course_code: 'CS101', status: 'in_progress' },
          { id: 4, student_id: 104, course_code: 'ML201', status: 'completed' },
          { id: 5, student_id: 105, course_code: 'ML201', status: 'dropped' },
          { id: 6, student_id: 106, course_code: 'SEC301', status: 'completed' } // only 1 student, filtered out
        ],
        expected: [
          { course_code: 'CS101', total_students: 3, completed_count: 2 },
          { course_code: 'ML201', total_students: 2, completed_count: 1 }
        ]
      }
    ],
    is_active: true
  },
  {
    id: 'challenge-ml-metrics',
    title: 'Machine Learning: Precision, Recall & F1 Evaluator',
    description: 'Calculate classification performance metrics from binary prediction arrays with safe edge-case handling.',
    skill_id: 'skill-ml',
    skill_name: 'Machine Learning Basics',
    difficulty: 'intermediate',
    estimated_minutes: 20,
    instructions: `### Objective
Write a function \`calculate_classification_metrics(y_true, y_pred)\` that computes binary classification performance.

### Definitions:
- True Positive (TP): \`y_true == 1 && y_pred == 1\`
- False Positive (FP): \`y_true == 0 && y_pred == 1\`
- False Negative (FN): \`y_true == 1 && y_pred == 0\`
- Precision: \`TP / (TP + FP)\` (return 0.0 if denominator is 0)
- Recall: \`TP / (TP + FN)\` (return 0.0 if denominator is 0)
- F1-Score: \`2 * (Precision * Recall) / (Precision + Recall)\` (return 0.0 if denominator is 0)

Return an object with \`{ precision, recall, f1_score }\` rounded to 3 decimal places.
`,
    starter_code: `def calculate_classification_metrics(y_true, y_pred):
    tp = fp = fn = 0
    for true, pred in zip(y_true, y_pred):
        if true == 1 and pred == 1:
            tp += 1
        elif true == 0 and pred == 1:
            fp += 1
        elif true == 1 and pred == 0:
            fn += 1
            
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    
    return {
        "precision": round(precision, 3),
        "recall": round(recall, 3),
        "f1_score": round(f1, 3)
    }
`,
    evaluation_type: 'code_tests',
    test_cases: [
      {
        id: 'tc-ml-1',
        description: 'Standard binary classification predictions',
        input: {
          y_true: [1, 1, 0, 1, 0, 0, 1, 0],
          y_pred: [1, 0, 0, 1, 0, 1, 1, 0]
        },
        expected: {
          precision: 0.75, // 3 TP / (3 TP + 1 FP) = 3/4
          recall: 0.75,    // 3 TP / (3 TP + 1 FN) = 3/4
          f1_score: 0.75
        }
      },
      {
        id: 'tc-ml-2',
        description: 'Edge case: All negative predictions (no TP or FP)',
        input: {
          y_true: [1, 0, 1],
          y_pred: [0, 0, 0]
        },
        expected: {
          precision: 0.0,
          recall: 0.0,
          f1_score: 0.0
        }
      }
    ],
    is_active: true
  }
];
