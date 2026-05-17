import { UserActivity } from '../../types';

export function calculateInterestScore(userId: string, opportunityId: string, activities: UserActivity[]) {
  const userActivities = activities.filter(a => a.userId === userId && a.opportunityId === opportunityId);
  let score = 0;
  userActivities.forEach(a => {
    if (a.type === 'view_details') score += 10;
    if (a.type === 'interested') score += 50;
    if (a.type === 'apply') score += 100;
    if (a.type === 'view_duration' && a.duration) {
      // Add 1 point for every 5 seconds spent, max 20 points
      score += Math.min(Math.floor(a.duration / 5), 20);
    }
  });
  // Bonus for repeat views
  const viewCount = userActivities.filter(a => a.type === 'view_details').length;
  if (viewCount > 2) score += 20;
  return score;
}

export function getInterestLevel(score: number) {
  if (score >= 100) return 'HOT';
  if (score >= 40) return 'WARM';
  return 'COLD';
}

export function getInterestColor(score: number) {
  if (score >= 100) return 'bg-red-100 text-red-700 border-red-200';
  if (score >= 40) return 'bg-orange-100 text-orange-700 border-orange-200';
  return 'bg-blue-100 text-blue-700 border-blue-200';
}
