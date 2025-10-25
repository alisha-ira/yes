import type { BrandProfile } from '../types';

export interface PostingFrequencyOption {
  id: string;
  label: string;
  postsPerWeek: number;
  description: string;
  recommended: boolean;
  reasons: string[];
}

export interface PlannedPost {
  title: string;
  suggestedDate: Date;
  suggestedTime: string;
  rationale: string;
  platforms: string[];
  orderInPlan: number;
}

export interface ContentPlan {
  planName: string;
  startDate: Date;
  endDate: Date;
  frequency: string;
  posts: PlannedPost[];
  totalPosts: number;
  insights: string[];
}

export function getPostingFrequencyRecommendations(
  industry?: string,
  currentFollowers?: number
): PostingFrequencyOption[] {
  const recommendations: PostingFrequencyOption[] = [
    {
      id: 'daily',
      label: 'Daily (7x per week)',
      postsPerWeek: 7,
      description: 'Post every day to maintain maximum visibility and engagement',
      recommended: false,
      reasons: [
        'Best for brands with large content teams',
        'Requires significant time investment',
        'Risk of audience fatigue if quality drops'
      ]
    },
    {
      id: '5x_week',
      label: '5x per week (Weekdays)',
      postsPerWeek: 5,
      description: 'Post Monday through Friday for consistent presence',
      recommended: industry === 'B2B' || industry === 'Tech',
      reasons: [
        'Ideal for B2B and professional audiences',
        'Aligns with business week patterns',
        'Sustainable for most teams'
      ]
    },
    {
      id: '3x_week',
      label: '3x per week',
      postsPerWeek: 3,
      description: 'Post 3 times weekly for consistent engagement without overwhelming',
      recommended: true,
      reasons: [
        'Sweet spot for most businesses',
        'Maintains presence without overwhelming',
        'Allows time for quality content creation',
        'Proven to drive engagement growth'
      ]
    },
    {
      id: '2x_week',
      label: '2x per week',
      postsPerWeek: 2,
      description: 'Post twice weekly for steady brand awareness',
      recommended: false,
      reasons: [
        'Good starting point for new brands',
        'Manageable for small teams',
        'May miss engagement opportunities'
      ]
    },
    {
      id: 'weekly',
      label: 'Weekly (1x per week)',
      postsPerWeek: 1,
      description: 'Post once weekly to maintain minimal presence',
      recommended: false,
      reasons: [
        'Minimum to stay visible',
        'Risk of being forgotten by audience',
        'Limited growth potential'
      ]
    }
  ];

  return recommendations;
}

export function getOptimalPostingTimes(
  platforms: string[],
  targetAudience?: string
): Record<string, { time: string; day: string; reason: string }[]> {
  const timingRecommendations: Record<string, { time: string; day: string; reason: string }[]> = {
    instagram: [
      { time: '11:00', day: 'wednesday', reason: 'Peak engagement time - users check during lunch break' },
      { time: '14:00', day: 'friday', reason: 'High activity as weekend approaches' },
      { time: '10:00', day: 'monday', reason: 'Strong start-of-week engagement' }
    ],
    twitter: [
      { time: '09:00', day: 'wednesday', reason: 'Morning commute browsing peak' },
      { time: '12:00', day: 'thursday', reason: 'Lunch break activity surge' },
      { time: '17:00', day: 'tuesday', reason: 'End-of-workday engagement' }
    ],
    linkedin: [
      { time: '08:00', day: 'tuesday', reason: 'Business professionals check before meetings' },
      { time: '12:00', day: 'wednesday', reason: 'Mid-week lunch break browsing' },
      { time: '10:00', day: 'thursday', reason: 'Morning professional networking time' }
    ],
    facebook: [
      { time: '13:00', day: 'wednesday', reason: 'Afternoon engagement peak' },
      { time: '19:00', day: 'friday', reason: 'Evening leisure time' },
      { time: '11:00', day: 'saturday', reason: 'Weekend casual browsing' }
    ]
  };

  return timingRecommendations;
}

export function generateContentPlan(
  startDate: Date,
  weeksToGenerate: number,
  postsPerWeek: number,
  platforms: string[],
  brandProfile?: BrandProfile | null
): ContentPlan {
  const posts: PlannedPost[] = [];
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + (weeksToGenerate * 7));

  const timingData = getOptimalPostingTimes(platforms);
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  let postCount = 0;
  let currentWeekStart = new Date(startDate);

  for (let week = 0; week < weeksToGenerate; week++) {
    const postsThisWeek = Math.min(postsPerWeek, (weeksToGenerate * postsPerWeek) - postCount);

    const weekPosts = distributePostsInWeek(
      currentWeekStart,
      postsThisWeek,
      platforms,
      timingData,
      daysOfWeek,
      brandProfile
    );

    weekPosts.forEach(post => {
      posts.push({
        ...post,
        orderInPlan: postCount++
      });
    });

    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }

  const insights = generatePlanInsights(posts, postsPerWeek, platforms, brandProfile);

  return {
    planName: `${brandProfile?.name || 'Content'} Plan - ${startDate.toLocaleDateString()}`,
    startDate,
    endDate,
    frequency: `${postsPerWeek}x per week`,
    posts,
    totalPosts: posts.length,
    insights
  };
}

function distributePostsInWeek(
  weekStart: Date,
  postsCount: number,
  platforms: string[],
  timingData: Record<string, { time: string; day: string; reason: string }[]>,
  daysOfWeek: string[],
  brandProfile?: BrandProfile | null
): PlannedPost[] {
  const posts: PlannedPost[] = [];
  const primaryPlatform = platforms[0] || 'instagram';
  const platformTimings = timingData[primaryPlatform] || timingData.instagram;

  const optimalDays = getOptimalDaysForPostCount(postsCount);

  optimalDays.forEach((dayOffset, index) => {
    const postDate = new Date(weekStart);
    postDate.setDate(postDate.getDate() + dayOffset);

    const timing = platformTimings[index % platformTimings.length];
    const dayName = daysOfWeek[postDate.getDay()];

    const themes = generateContentThemes(brandProfile);
    const theme = themes[index % themes.length];

    posts.push({
      title: `${theme} Post`,
      suggestedDate: postDate,
      suggestedTime: timing.time,
      rationale: `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}: ${timing.reason}`,
      platforms: platforms,
      orderInPlan: 0
    });
  });

  return posts;
}

function getOptimalDaysForPostCount(count: number): number[] {
  const distributions: Record<number, number[]> = {
    1: [2],
    2: [1, 4],
    3: [1, 3, 5],
    4: [1, 2, 4, 5],
    5: [1, 2, 3, 4, 5],
    6: [1, 2, 3, 4, 5, 6],
    7: [0, 1, 2, 3, 4, 5, 6]
  };

  return distributions[Math.min(count, 7)] || distributions[3];
}

function generateContentThemes(brandProfile?: BrandProfile | null): string[] {
  const baseThemes = [
    'Educational',
    'Behind the Scenes',
    'Product Showcase',
    'Customer Story',
    'Industry Insight',
    'Tip & Trick',
    'Inspiration',
    'Company Update',
    'User-Generated Content',
    'Trending Topic'
  ];

  if (brandProfile?.content_themes && brandProfile.content_themes.length > 0) {
    return [...brandProfile.content_themes, ...baseThemes];
  }

  return baseThemes;
}

function generatePlanInsights(
  posts: PlannedPost[],
  postsPerWeek: number,
  platforms: string[],
  brandProfile?: BrandProfile | null
): string[] {
  const insights: string[] = [];

  insights.push(`📅 ${posts.length} posts planned across ${Math.ceil(posts.length / postsPerWeek)} weeks`);

  const dayDistribution = posts.reduce((acc, post) => {
    const day = post.suggestedDate.toLocaleDateString('en-US', { weekday: 'long' });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostFrequentDay = Object.entries(dayDistribution)
    .sort(([, a], [, b]) => b - a)[0];
  insights.push(`📊 Most posts scheduled on ${mostFrequentDay[0]}s (${mostFrequentDay[1]} posts)`);

  if (platforms.length > 1) {
    insights.push(`🎯 Cross-posting to ${platforms.length} platforms for maximum reach`);
  }

  const avgTimeGap = calculateAverageTimeBetweenPosts(posts);
  insights.push(`⏰ Average ${avgTimeGap} between posts for consistent engagement`);

  if (postsPerWeek >= 3) {
    insights.push(`✅ Optimal frequency for algorithm favor and audience engagement`);
  }

  if (brandProfile?.target_audience) {
    insights.push(`🎯 Timing optimized for your target audience behavior patterns`);
  }

  return insights;
}

function calculateAverageTimeBetweenPosts(posts: PlannedPost[]): string {
  if (posts.length < 2) return '0 days';

  const sortedPosts = [...posts].sort((a, b) =>
    a.suggestedDate.getTime() - b.suggestedDate.getTime()
  );

  let totalDays = 0;
  for (let i = 1; i < sortedPosts.length; i++) {
    const days = Math.floor(
      (sortedPosts[i].suggestedDate.getTime() - sortedPosts[i - 1].suggestedDate.getTime()) /
      (1000 * 60 * 60 * 24)
    );
    totalDays += days;
  }

  const avgDays = Math.round(totalDays / (sortedPosts.length - 1));

  if (avgDays === 0) return 'same day';
  if (avgDays === 1) return '1 day';
  return `${avgDays} days`;
}
