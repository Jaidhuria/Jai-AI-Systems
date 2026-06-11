export const mockData = {
  userProfile: {
    name: "Alex Mercer",
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Alex",
    joinDate: "September 2025"
  },
  
  overallStats: {
    sleepEfficiency: { value: 87, unit: "%", change: "+4.2%", status: "positive" },
    focusScore: { value: 72, unit: "/100", change: "-12.5%", status: "negative" },
    activityHours: { value: 1.8, unit: "hrs/day", change: "+15%", status: "positive" },
    screenTime: { value: 5.2, unit: "hrs/day", change: "+1.4h", status: "negative" },
    averageConfidence: 89 // overall confidence score
  },

  metrics: [
    {
      id: "sleep",
      name: "Sleep Quality",
      value: "84",
      unit: "/100",
      change: "+5.1%",
      trend: "up",
      status: "positive",
      confidence: 94,
      confidenceText: "High confidence based on continuous Apple Watch accelerometer & heart rate data.",
      color: "#818cf8", // indigo
      description: "Average sleep duration was 7.4 hours with optimal deep sleep proportions."
    },
    {
      id: "focus",
      name: "Cognitive Focus",
      value: "68",
      unit: "/100",
      change: "-12%",
      trend: "down",
      status: "negative",
      confidence: 76,
      confidenceText: "Medium confidence due to missing work machine tracking agent for 2 days.",
      color: "#f472b6", // pink
      description: "Deep work duration dropped to an average of 1.5 hours per session."
    },
    {
      id: "activity",
      name: "Physical Activity",
      value: "420",
      unit: "kcal",
      change: "+8%",
      trend: "up",
      status: "positive",
      confidence: 98,
      confidenceText: "Very High confidence from Apple Health and active GPS tracking.",
      color: "#34d399", // emerald
      description: "Active energy expenditure peaked during late afternoon workouts."
    },
    {
      id: "screentime",
      name: "Evening Screen Time",
      value: "2.8",
      unit: "hrs",
      change: "+28%",
      trend: "up",
      status: "warning",
      confidence: 85,
      confidenceText: "High confidence from mobile and desktop usage logs.",
      color: "#fb7185", // rose
      description: "Device activity between 9 PM and 12 AM exceeded normal baseline threshold."
    }
  ],

  recentChanges: [
    {
      id: "change-1",
      title: "Sleep Offset Delayed",
      description: "Your average bedtime shifted 45 minutes later this week, highly correlated with evening screen time spikes.",
      type: "shift",
      time: "24h ago",
      severity: "warning"
    },
    {
      id: "change-2",
      title: "HRV Recovery Surge",
      description: "Heart Rate Variability increased by 14ms following two consecutive rest days, showing positive adaptive recovery.",
      type: "improvement",
      time: "2 days ago",
      severity: "positive"
    },
    {
      id: "change-3",
      title: "Morning Focus Degradation",
      description: "Focus scores between 9 AM and 11 AM dropped by 22% on days when coffee was consumed before 8 AM.",
      type: "anomaly",
      time: "3 days ago",
      severity: "negative"
    }
  ],

  confidenceIndicators: [
    {
      id: "watch",
      source: "Apple Watch (HR & Movement)",
      status: "active",
      reliability: "98%",
      explanation: "Continuous tracking active. Watch was worn 23.5 hours daily. Only removed for charging at 6 PM.",
      impact: "High confidence in sleep stages, HRV, and physical exertion metrics."
    },
    {
      id: "phone",
      source: "Phone Usage API",
      status: "active",
      reliability: "95%",
      explanation: "Screen-on state and notification logs processed correctly. No gaps in background synchronization.",
      impact: "High confidence in blue-light exposure and morning screen pickup latency."
    },
    {
      id: "work_desktop",
      source: "Desktop Work Agent",
      status: "intermittent",
      reliability: "60%",
      explanation: "Agent was disabled or offline on Tuesday & Wednesday due to a VPN certificate expiry.",
      impact: "Medium confidence in cognitive focus metrics and deep work logs during mid-week."
    },
    {
      id: "dietary",
      source: "Self-Reported Logs",
      status: "missing",
      reliability: "40%",
      explanation: "Caffeine and meal times logging was skipped on Saturday & Sunday (48-hour gap).",
      impact: "Low confidence in nutritional correlations and circadian entrainment markers for the weekend."
    }
  ],

  insights: [
    {
      id: "insight-caffeine",
      title: "Delay Caffeine to Protect Morning Focus",
      category: "Focus & Circadian",
      impact: "High",
      confidence: 88,
      summary: "Consuming caffeine within 90 minutes of waking causes a mid-morning energy crash and decreases subsequent focus duration.",
      description: "When you drink coffee immediately upon waking, it interferes with the natural clearance of adenosine (the sleepiness molecule). As the caffeine wears off around 10:30 AM, accumulated adenosine binds to receptors simultaneously, resulting in a severe crash. Waiting 90-120 minutes allows your body to naturally clear remaining adenosine using cortisol, leading to sustained alertness.",
      supportingEvidence: [
        { label: "Focus Duration (Caffeine <60m waking)", value: 45, unit: "mins" },
        { label: "Focus Duration (Caffeine >90m waking)", value: 110, unit: "mins" },
        { label: "Afternoon Crash Probability", value: 78, unit: "%" },
        { label: "Afternoon Crash Probability (Delayed)", value: 22, unit: "%" }
      ],
      chartData: [
        { day: "Mon", focus: 55, delay: 30 },
        { day: "Tue", focus: 48, delay: 15 },
        { day: "Wed", focus: 92, delay: 100 },
        { day: "Thu", focus: 88, delay: 110 },
        { day: "Fri", focus: 45, delay: 20 },
        { day: "Sat", focus: 60, delay: 40 },
        { day: "Sun", focus: 95, delay: 120 }
      ],
      uncertaintyExplanation: "Dietary logging was missed on the weekend. Chronis assumed standard wake-up times for Saturday and Sunday based on phone movement data rather than verified sleep monitoring, reducing correlation accuracy for those days.",
      recommendation: "Set a timer on your phone when you wake up. Do not drink coffee or tea until the countdown reaches zero (minimum 90 minutes post-waking). Try replacement options like water or herbal tea first.",
      actionLabel: "Start 90-Min Caffeine Delay Protocol"
    },
    {
      id: "insight-screentime",
      title: "Late Screen Time Suppresses Sleep Quality",
      category: "Sleep & Circadian",
      impact: "High",
      confidence: 94,
      summary: "Active screen usage after 10:00 PM is directly followed by a 15% reduction in deep sleep duration and longer sleep latency.",
      description: "Exposure to blue-spectrum light from your phone and computer screen after dark suppresses the synthesis of melatonin, the hormone responsible for signaling sleep readiness to the brain. This delays your transition into deep sleep (stages 3 & 4), which is critical for physical recovery and brain clearing.",
      supportingEvidence: [
        { label: "Sleep Latency (Screen after 10 PM)", value: 34, unit: "mins" },
        { label: "Sleep Latency (No Screen after 10 PM)", value: 12, unit: "mins" },
        { label: "Deep Sleep Duration (Screen)", value: 48, unit: "mins" },
        { label: "Deep Sleep Duration (No Screen)", value: 82, unit: "mins" }
      ],
      chartData: [
        { day: "Mon", sleepQuality: 68, screenMinutes: 90 },
        { day: "Tue", sleepQuality: 64, screenMinutes: 120 },
        { day: "Wed", sleepQuality: 88, screenMinutes: 10 },
        { day: "Thu", sleepQuality: 86, screenMinutes: 15 },
        { day: "Fri", sleepQuality: 58, screenMinutes: 140 },
        { day: "Sat", sleepQuality: 74, screenMinutes: 60 },
        { day: "Sun", sleepQuality: 90, screenMinutes: 5 }
      ],
      uncertaintyExplanation: "Perfect watch wear alignment. The data matches physical sleep tracking and device activity metrics with 94% accuracy. The remaining 6% is due to potential background light sources (ambient room lighting) which cannot be sensed.",
      recommendation: "Enable downtime on your iOS/Android device starting at 10 PM. Put your phone charging dock in another room. Keep a physical book on your nightstand to replace screen habit loop.",
      actionLabel: "Commit to 10 PM Digital Sunset"
    },
    {
      id: "insight-hrv-exercise",
      title: "Mid-Day Cardio Drives Next-Day HRV Recovery",
      category: "Recovery & Activity",
      impact: "Medium",
      confidence: 76,
      summary: "30+ minutes of aerobic activity between 12 PM and 4 PM correlates with a 15ms increase in next-morning Heart Rate Variability.",
      description: "Aerobic workouts in the mid-afternoon stimulate the sympathetic nervous system and core body temperature at an optimal phase of your circadian cycle. This allows for a deeper parasympathetic 'rebound' during sleep, lowering nocturnal heart rate and significantly boosting autonomic system balance (HRV). Avoid doing this after 7 PM, as it can delay melatonin release.",
      supportingEvidence: [
        { label: "Next-Day HRV (No Exercise)", value: 54, unit: "ms" },
        { label: "Next-Day HRV (Mid-Day Cardio)", value: 69, unit: "ms" },
        { label: "Average Resting Heart Rate (Rest)", value: 62, unit: "bpm" },
        { label: "Average Resting Heart Rate (Post-Cardio)", value: 57, unit: "bpm" }
      ],
      chartData: [
        { day: "Mon", hrv: 52, cardioMinutes: 0 },
        { day: "Tue", hrv: 70, cardioMinutes: 45 },
        { day: "Wed", hrv: 72, cardioMinutes: 30 },
        { day: "Thu", hrv: 55, cardioMinutes: 0 },
        { day: "Fri", hrv: 51, cardioMinutes: 0 },
        { day: "Sat", hrv: 68, cardioMinutes: 50 },
        { day: "Sun", hrv: 75, cardioMinutes: 40 }
      ],
      uncertaintyExplanation: "Heart rate variability readings had a 2-hour gap on Monday due to a watch sensor cleaning warning. Chronis interpolated the missing data, which reduces confidence from 92% to 76% for this insight.",
      recommendation: "Schedule a 30-minute brisk walk or run between 12 PM and 2 PM. If working, block this time out in your calendar as 'Circadian Conditioning'.",
      actionLabel: "Add Cardio Blocks to Calendar"
    }
  ],

  timelineEpochs: [
    {
      id: "epoch-1",
      title: "Baseline Audit",
      period: "Weeks 1 - 2",
      description: "An initial calibration phase where you logged your standard routine without behavioral interventions. Your sleep schedule was irregular, caffeine intake was immediate, and screen use extended past midnight.",
      metrics: {
        sleepQuality: "71/100",
        focusDuration: "2.1 hrs/day",
        eveningScreen: "2.9 hrs/night",
        caffeineDelay: "15 mins"
      },
      findings: [
        "Identified critical link between late phone usage and sleep onset insomnia.",
        "Observed regular mid-morning fatigue crashes on days when caffeine was consumed immediately.",
        "Discovered that focus windows are highly concentrated around 11:30 AM."
      ],
      status: "Completed",
      outcome: "Baseline verified. Chronis flagged caffeine timing and screen habits as primary levers."
    },
    {
      id: "epoch-2",
      title: "The Caffeine Shift",
      period: "Weeks 3 - 4",
      description: "The first intervention where you delayed caffeine intake by at least 90 minutes. Sleep schedules and screen times remained unchanged to isolate the impact of caffeine scheduling on alertness.",
      metrics: {
        sleepQuality: "73/100",
        focusDuration: "3.4 hrs/day",
        eveningScreen: "3.1 hrs/night",
        caffeineDelay: "95 mins"
      },
      findings: [
        "Focus duration increased by 61% (from 2.1h to 3.4h per day).",
        "Subjective rating of mid-morning energy levels improved from 'Sluggish' to 'Steady'.",
        "Sleep quality stayed relatively flat, indicating sleep issues are independent of caffeine caffeine timing."
      ],
      status: "Completed",
      outcome: "Success. Mid-morning crash minimized. Decided to tackle sleep quality next."
    },
    {
      id: "epoch-3",
      title: "Digital Sunset Experiment",
      period: "Weeks 5 - 6 (Current)",
      description: "The active phase focusing on melatonin preservation. You committed to disabling screens by 10 PM. Watch compliance was high to capture sleep latency and deep sleep duration improvements.",
      metrics: {
        sleepQuality: "84/100",
        focusDuration: "3.8 hrs/day",
        eveningScreen: "0.4 hrs/night",
        caffeineDelay: "105 mins"
      },
      findings: [
        "Sleep quality surged from 73 to 84/100, driven by a 34-minute increase in Deep Sleep.",
        "Sleep latency (time to fall asleep) dropped from 32 minutes to 11 minutes.",
        "HRV levels showed a positive upward trend (+8ms) indicating decreased physiological stress."
      ],
      status: "Ongoing",
      outcome: "In-progress. Best sleep consistency recorded in 6 months. High watch sensor compliance (98%)."
    }
  ]
};
