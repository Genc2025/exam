export const domains = ['People', 'Process', 'Business Environment'];

export const lessons = [
  {
    id: 'people-1',
    title: 'Stakeholder engagement',
    domain: 'People',
    minutes: 18,
    detail: 'Identify needs, manage communication, and maintain alignment.'
  },
  {
    id: 'people-2',
    title: 'Conflict resolution',
    domain: 'People',
    minutes: 16,
    detail: 'Use active listening, root-cause analysis, and escalation rules.'
  },
  {
    id: 'people-3',
    title: 'Team motivation and coaching',
    domain: 'People',
    minutes: 20,
    detail: 'Recognize progress, remove blockers, and coach for performance.'
  },
  {
    id: 'process-1',
    title: 'Change control',
    domain: 'Process',
    minutes: 22,
    detail: 'Evaluate impact, approve changes, and update the baseline.'
  },
  {
    id: 'process-2',
    title: 'Risk response planning',
    domain: 'Process',
    minutes: 20,
    detail: 'Choose avoid, mitigate, transfer, accept, or exploit appropriately.'
  },
  {
    id: 'process-3',
    title: 'Quality and lessons learned',
    domain: 'Process',
    minutes: 18,
    detail: 'Inspect outcomes, capture lessons, and improve the next cycle.'
  },
  {
    id: 'business-1',
    title: 'Governance and compliance',
    domain: 'Business Environment',
    minutes: 18,
    detail: 'Align delivery with strategy, policies, and obligations.'
  },
  {
    id: 'business-2',
    title: 'Value delivery',
    domain: 'Business Environment',
    minutes: 24,
    detail: 'Track outcomes, benefits, and business value realization.'
  },
  {
    id: 'business-3',
    title: 'Business case alignment',
    domain: 'Business Environment',
    minutes: 16,
    detail: 'Keep the work tied to measurable organizational outcomes.'
  }
];

export const practiceQuestions = [
  {
    id: 1,
    domain: 'People',
    difficulty: 'Medium',
    stem: 'Two team members are in conflict about ownership of a task. What is the best next step?',
    options: [
      'Ignore it and let them resolve it themselves.',
      'Clarify responsibilities, listen to both sides, and mediate a solution.',
      'Reassign the task without discussion.',
      'Escalate immediately to the sponsor.'
    ],
    answer: 1,
    rationale: 'Clarify responsibilities and mediate first. Escalation is a later step when direct resolution fails.'
  },
  {
    id: 2,
    domain: 'Process',
    difficulty: 'Medium',
    stem: 'A major deliverable is approved after review. What should happen next?',
    options: [
      'Store the approval and stop all communication.',
      'Update relevant plans and inform impacted stakeholders.',
      'Start a new deliverable immediately.',
      'Cancel the remaining risk log.'
    ],
    answer: 1,
    rationale: 'Approved deliverables usually trigger baseline updates and stakeholder communication.'
  },
  {
    id: 3,
    domain: 'Business Environment',
    difficulty: 'Medium',
    stem: 'Which action best supports benefits realization?',
    options: [
      'Track only task completion.',
      'Measure outcomes against the business case.',
      'Avoid stakeholder reporting.',
      'Focus only on the schedule.'
    ],
    answer: 1,
    rationale: 'Benefits realization is about outcomes and business value, not only outputs.'
  },
  {
    id: 4,
    domain: 'People',
    difficulty: 'Easy',
    stem: 'What is the strongest signal of active listening?',
    options: [
      'Interrupting to offer a fast fix.',
      'Repeating back the key concern in your own words.',
      'Changing the subject to avoid tension.',
      'Sending an email instead of meeting.'
    ],
    answer: 1,
    rationale: 'Reflecting the concern shows understanding and helps surface the real issue.'
  },
  {
    id: 5,
    domain: 'Process',
    difficulty: 'Hard',
    stem: 'A risk response plan exists, but the event occurs. What is the correct immediate action?',
    options: [
      'Wait for the next status meeting.',
      'Execute the response and document the result.',
      'Delete the risk from the register.',
      'Ask the team to vote on what to do.'
    ],
    answer: 1,
    rationale: 'Once a risk occurs, the predefined response should be executed promptly.'
  },
  {
    id: 6,
    domain: 'People',
    difficulty: 'Hard',
    stem: 'A team member is competent but disengaged. What should the leader do first?',
    options: [
      'Assume the person lacks motivation and reassign the work.',
      'Discuss blockers, expectations, and support needs.',
      'Remove the person from the team immediately.',
      'Ignore the issue until the end of the sprint.'
    ],
    answer: 1,
    rationale: 'First diagnose blockers and support needs before making structural changes.'
  },
  {
    id: 7,
    domain: 'Business Environment',
    difficulty: 'Easy',
    stem: 'Why is governance important in a project?',
    options: [
      'It helps ensure decisions align with policies and strategy.',
      'It eliminates the need for communication.',
      'It replaces planning.',
      'It guarantees every outcome is positive.'
    ],
    answer: 0,
    rationale: 'Governance connects decisions to policies, strategy, and accountability.'
  },
  {
    id: 8,
    domain: 'Process',
    difficulty: 'Easy',
    stem: 'What is the main purpose of a change control process?',
    options: [
      'To prevent any changes forever.',
      'To evaluate and manage changes before implementation.',
      'To hide issues from stakeholders.',
      'To reduce team collaboration.'
    ],
    answer: 1,
    rationale: 'Change control manages impact before changes are implemented.'
  },
  {
    id: 9,
    domain: 'People',
    difficulty: 'Medium',
    stem: 'A stakeholder wants more detail than others. What is the best response?',
    options: [
      'Send the same communication to everyone.',
      'Tailor the communication to that stakeholder’s needs.',
      'Refuse to adjust because consistency matters.',
      'Wait until the project ends.'
    ],
    answer: 1,
    rationale: 'Communication should be adapted to stakeholder requirements.'
  },
  {
    id: 10,
    domain: 'Business Environment',
    difficulty: 'Medium',
    stem: 'Which result best shows strategic alignment?',
    options: [
      'The team is busy every day.',
      'Deliverables support measurable organizational objectives.',
      'The budget file is complete.',
      'The meeting cadence is high.'
    ],
    answer: 1,
    rationale: 'Strategic alignment is judged by whether the work supports objectives.'
  },
  {
    id: 11,
    domain: 'Process',
    difficulty: 'Medium',
    stem: 'What should happen after an approved change is implemented?',
    options: [
      'Ignore documentation because the change is already done.',
      'Update the baselines and communicate the new status.',
      'Start another change immediately.',
      'Delete the old version history.'
    ],
    answer: 1,
    rationale: 'Implementation must be followed by baseline updates and communication.'
  },
  {
    id: 12,
    domain: 'People',
    difficulty: 'Easy',
    stem: 'What is the best way to maintain team motivation over time?',
    options: [
      'Keep expectations hidden.',
      'Recognize progress and remove blockers.',
      'Change priorities daily.',
      'Reduce communication.'
    ],
    answer: 1,
    rationale: 'Recognition and blocker removal support sustained motivation.'
  },
  {
    id: 13,
    domain: 'Process',
    difficulty: 'Medium',
    stem: 'A schedule milestone is slipping. What is the best immediate action?',
    options: [
      'Hide the delay until the next release.',
      'Assess impact, update stakeholders, and replan recovery options.',
      'Cancel the milestone without discussion.',
      'Ignore the dependency chain.'
    ],
    answer: 1,
    rationale: 'A slip should trigger impact analysis, communication, and replanning.'
  },
  {
    id: 14,
    domain: 'Business Environment',
    difficulty: 'Hard',
    stem: 'What is the strongest indicator that an initiative should continue?',
    options: [
      'The team enjoys the work.',
      'The value delivered still supports strategic outcomes.',
      'The budget remains large.',
      'The schedule is full of activities.'
    ],
    answer: 1,
    rationale: 'Continuation should be driven by ongoing strategic value, not activity volume.'
  },
  {
    id: 15,
    domain: 'People',
    difficulty: 'Hard',
    stem: 'A difficult stakeholder keeps pushing for scope beyond the plan. What should the team do first?',
    options: [
      'Accept every request to stay friendly.',
      'Reconfirm scope, explain impact, and use change control.',
      'Stop all communication with the stakeholder.',
      'Escalate without any discussion.'
    ],
    answer: 1,
    rationale: 'Use scope clarification and change control before escalation.'
  },
  {
    id: 16,
    domain: 'Process',
    difficulty: 'Easy',
    stem: 'Which action best supports quality management?',
    options: [
      'Inspect late and correct everything at the end.',
      'Build quality into the process and verify outputs along the way.',
      'Ignore defects until the final audit.',
      'Focus only on speed.'
    ],
    answer: 1,
    rationale: 'Quality is managed continuously, not only at the end.'
  },
  {
    id: 17,
    domain: 'Business Environment',
    difficulty: 'Medium',
    stem: 'Why should lessons learned be captured during delivery?',
    options: [
      'To create more paperwork.',
      'To improve future decisions and organizational learning.',
      'To slow the team down.',
      'To avoid communication.'
    ],
    answer: 1,
    rationale: 'Lessons learned support continuous improvement and future performance.'
  },
  {
    id: 18,
    domain: 'People',
    difficulty: 'Medium',
    stem: 'What is the best way to handle a quiet team member with useful ideas?',
    options: [
      'Assume they have nothing to add.',
      'Invite them directly to contribute in a safe setting.',
      'Allow others to speak over them.',
      'Wait until the meeting ends.'
    ],
    answer: 1,
    rationale: 'A psychologically safe invitation can surface valuable input.'
  },
  {
    id: 19,
    domain: 'Process',
    difficulty: 'Medium',
    stem: 'What is the correct purpose of a retrospective?',
    options: [
      'Assign blame for the last iteration.',
      'Identify improvements for future work.',
      'Cancel all remaining work.',
      'Approve funding changes.'
    ],
    answer: 1,
    rationale: 'Retrospectives are used to improve the next cycle, not to assign blame.'
  },
  {
    id: 20,
    domain: 'Business Environment',
    difficulty: 'Easy',
    stem: 'Which statement best describes value delivery?',
    options: [
      'Finishing tasks as fast as possible.',
      'Producing measurable outcomes that matter to the organization.',
      'Holding more meetings.',
      'Expanding scope continuously.'
    ],
    answer: 1,
    rationale: 'Value delivery is about measurable outcomes, not output volume.'
  },
  {
    id: 21,
    domain: 'People',
    difficulty: 'Medium',
    stem: 'A new team member is struggling with the process. What is the best support action?',
    options: [
      'Expect them to learn everything alone.',
      'Pair them with a mentor and clarify expectations.',
      'Remove them from the project.',
      'Reduce communication until they catch up.'
    ],
    answer: 1,
    rationale: 'Mentoring and expectation setting accelerate integration.'
  },
  {
    id: 22,
    domain: 'Process',
    difficulty: 'Hard',
    stem: 'A change introduces risk to multiple deliverables. What should happen first?',
    options: [
      'Approve it immediately to avoid delay.',
      'Assess impact across scope, schedule, and risk before approval.',
      'Ignore downstream effects.',
      'Ask the team to implement and analyze later.'
    ],
    answer: 1,
    rationale: 'Multi-deliverable changes require cross-impact analysis before approval.'
  },
  {
    id: 23,
    domain: 'Business Environment',
    difficulty: 'Hard',
    stem: 'How should leadership respond when a project no longer aligns with strategy?',
    options: [
      'Continue because the team has already worked on it.',
      'Reevaluate the initiative and consider stopping or reshaping it.',
      'Ignore the strategy change.',
      'Add more reporting only.'
    ],
    answer: 1,
    rationale: 'Projects should be reevaluated when strategic alignment changes.'
  },
  {
    id: 24,
    domain: 'Process',
    difficulty: 'Medium',
    stem: 'What should a project manager do before the final handoff?',
    options: [
      'Skip verification to close faster.',
      'Confirm deliverables, acceptance, and documentation completeness.',
      'Delete the issue log.',
      'Rename unfinished tasks as complete.'
    ],
    answer: 1,
    rationale: 'Closure requires verified deliverables, acceptance, and complete documentation.'
  }
];

export const flashcards = [
  { front: 'Stakeholder engagement', back: 'Tailor communication, track needs, and maintain alignment.' },
  { front: 'Change control', back: 'Evaluate impact before implementation and update baselines after approval.' },
  { front: 'Benefits realization', back: 'Measure whether the work delivers actual business value.' },
  { front: 'Active listening', back: 'Reflect the concern in your own words before responding.' },
  { front: 'Risk response', back: 'Execute the predefined response when the risk occurs.' },
  { front: 'Governance', back: 'Ensure decisions align with strategy, policy, and accountability.' },
  { front: 'Conflict resolution', back: 'Clarify interests first, then mediate a solution.' },
  { front: 'Team motivation', back: 'Recognize progress and remove blockers.' },
  { front: 'Lessons learned', back: 'Capture insights during delivery to improve future performance.' },
  { front: 'Quality management', back: 'Build quality into the process and verify outputs continuously.' },
  { front: 'Strategic alignment', back: 'Keep work tied to measurable organizational objectives.' },
  { front: 'Retrospective', back: 'Identify improvements for the next cycle, not blame.' }
];
