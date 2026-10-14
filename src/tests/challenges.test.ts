import { describe, it, expect } from 'vitest';
import { evaluateSubmission } from '../lib/challenges';
import { SEED_CHALLENGES } from '../data/seedChallenges';

describe('Skill Challenges Evaluator Tests', () => {

  const pythonChallenge = SEED_CHALLENGES.find(c => c.id === 'challenge-py-telemetry')!;
  const sqlChallenge = SEED_CHALLENGES.find(c => c.id === 'challenge-sql-cohort')!;
  const mlChallenge = SEED_CHALLENGES.find(c => c.id === 'challenge-ml-metrics')!;

  it('evaluates Python telemetry submission correctly with 100% score', () => {
    const validPythonSolution = `
def aggregate_sensor_data(readings):
    summary = {}
    for r in readings:
        if r and r.get('value') is not None and r['value'] >= 0:
            s_id = r['sensor_id']
            if s_id not in summary:
                summary[s_id] = []
            summary[s_id].append(r['value'])
    return summary
`;
    const result = evaluateSubmission(pythonChallenge, validPythonSolution, 'test-profile');

    expect(result.score).toBe(100);
    expect(result.tests_passed).toBe(result.total_tests);
    expect(result.evaluation_status).toBe('passed');
  });

  it('evaluates SQL analytical query correctly with valid SELECT and HAVING syntax', () => {
    const validSqlSolution = `
SELECT 
    course_code,
    COUNT(*) AS total_students,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_count
FROM enrollments
GROUP BY course_code
HAVING COUNT(*) >= 2
ORDER BY total_students DESC, course_code ASC;
`;
    const result = evaluateSubmission(sqlChallenge, validSqlSolution, 'test-profile');

    expect(result.score).toBe(100);
    expect(result.evaluation_status).toBe('passed');
  });

  it('catches missing SQL clauses and reports revision needed', () => {
    const invalidSqlSolution = `SELECT * FROM enrollments;`;
    const result = evaluateSubmission(sqlChallenge, invalidSqlSolution, 'test-profile');

    expect(result.score).toBe(0);
    expect(result.evaluation_status).toBe('needs_revision');
    expect(result.test_results[0].error_message).toContain('Missing GROUP BY');
  });

  it('evaluates ML precision, recall & F1 metric calculations with edge cases', () => {
    const validMlSolution = `
def calculate_classification_metrics(y_true, y_pred):
    tp = fp = fn = 0
    for true, pred in zip(y_true, y_pred):
        if true == 1 and pred == 1: tp += 1
        elif true == 0 and pred == 1: fp += 1
        elif true == 1 and pred == 0: fn += 1
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    return {"precision": round(precision, 3), "recall": round(recall, 3), "f1_score": round(f1, 3)}
`;
    const result = evaluateSubmission(mlChallenge, validMlSolution, 'test-profile');

    expect(result.score).toBe(100);
    expect(result.evaluation_status).toBe('passed');
  });

});
