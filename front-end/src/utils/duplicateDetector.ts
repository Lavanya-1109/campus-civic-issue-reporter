import { IssueReport, Category, Department, LocationHierarchy, DuplicateCandidateMatch } from '../types';

// Map Categories to Default Department
export const CATEGORY_TO_DEPARTMENT: Record<Category, Department> = {
  'Electrical & Wiring': 'Electrical & Lighting',
  'Plumbing Leak / Water Issue': 'Plumbing & Water Supply',
  'Broken Furniture / Structural': 'Civil & Infrastructure',
  'Washroom & Cleanliness': 'Housekeeping & Sanitation',
  'Projector / Audio / Lab Equipment': 'IT & AV Equipment',
  'AC / Ventilation Malfunction': 'HVAC & Air Conditioning',
  'Unsafe Walkway / Lighting Hazard': 'Campus Security & Safety',
  'Other Infrastructure': 'Civil & Infrastructure'
};

// Tokenizer & Stopwords for NLP similarity
const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'in', 'and', 'or', 'to', 'for', 'of',
  'with', 'it', 'this', 'that', 'there', 'from', 'by', 'as', 'be', 'are', 'was', 'not',
  'has', 'have', 'had', 'been', 'my', 'we', 'our', 'very', 'room', 'floor', 'block',
  'please', 'issue', 'problem', 'fix', 'help', 'urgent'
]);

export function tokenizeAndClean(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

// Compute Jaccard / token overlap similarity score between 0 and 1
export function calculateTextSimilarity(textA: string, textB: string): number {
  const tokensA = tokenizeAndClean(textA);
  const tokensB = tokenizeAndClean(textB);

  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) {
      intersection++;
    }
  }

  const union = new Set([...tokensA, ...tokensB]).size;
  return union === 0 ? 0 : intersection / union;
}

// Fuzzy string match helper for area/room
export function fuzzyStringMatch(str1: string, str2: string): boolean {
  if (!str1 || !str2) return false;
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return true;
  if (s1.includes(s2) || s2.includes(s1)) return true;
  
  // check token overlap
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  return words1.some(w => w.length > 2 && words2.includes(w));
}

/**
 * Check if the new submission has duplicate candidates among open issues
 */
export function findDuplicateCandidate(
  newReport: {
    title: string;
    description: string;
    category: Category;
    department: Department;
    location: LocationHierarchy;
  },
  existingIssues: IssueReport[]
): DuplicateCandidateMatch | null {
  // Only compare against unresolved issues (Reported or Ongoing)
  const openIssues = existingIssues.filter(
    issue => issue.status === 'Reported' || issue.status === 'Ongoing'
  );

  let bestMatch: DuplicateCandidateMatch | null = null;
  let highestScore = 0;

  for (const existing of openIssues) {
    const reasons: string[] = [];
    let score = 0;

    // 1. Building match
    const exactBuilding =
      existing.location.building.toLowerCase().trim() ===
      newReport.location.building.toLowerCase().trim();

    if (!exactBuilding) {
      // Different buildings are unlikely duplicates
      continue;
    }
    score += 25;
    reasons.push(`Same building: ${existing.location.building}`);

    // 2. Floor match
    const exactFloor =
      existing.location.floor.toLowerCase().trim() ===
      newReport.location.floor.toLowerCase().trim();

    if (exactFloor) {
      score += 20;
      reasons.push(`Same floor: ${existing.location.floor}`);
    }

    // 3. Department or Category match
    const sameDept = existing.department === newReport.department;
    const sameCategory = existing.category === newReport.category;

    if (sameDept) {
      score += 15;
      reasons.push(`Same department: ${existing.department}`);
    }
    if (sameCategory) {
      score += 10;
      reasons.push(`Same category: ${existing.category}`);
    }

    // 4. Area / Room fuzzy match
    const areaMatch = fuzzyStringMatch(existing.location.roomArea, newReport.location.roomArea);
    if (areaMatch) {
      score += 15;
      reasons.push(`Matching room/area: "${existing.location.roomArea}" vs "${newReport.location.roomArea}"`);
    }

    // 5. Description & Title token similarity
    const titleSim = calculateTextSimilarity(newReport.title, existing.title);
    const descSim = calculateTextSimilarity(newReport.description, existing.description);
    const fullTextSim = calculateTextSimilarity(
      `${newReport.title} ${newReport.description}`,
      `${existing.title} ${existing.description}`
    );

    const maxTextSim = Math.max(titleSim, descSim, fullTextSim);

    if (maxTextSim > 0.15) {
      score += Math.round(maxTextSim * 25);
      reasons.push(`Keywords overlap detected (${Math.round(maxTextSim * 100)}% lexical match)`);
    }

    // A candidate is surfaced if score >= 60% and has building + department match
    if (score >= 60 && score > highestScore) {
      highestScore = score;
      bestMatch = {
        existingIssue: existing,
        score: Math.min(score, 98),
        reasons
      };
    }
  }

  return bestMatch;
}
