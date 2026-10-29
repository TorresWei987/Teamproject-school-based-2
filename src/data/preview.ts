import type { HandbookAdapter, SearchResult } from '../types';

/** Visual fixtures only. These categories and text are not verified school policies. */
export const previewHandbook: HandbookAdapter = {
  isSample: true,
  categories: [
    { id: 'attendance', title: 'Attendance', description: 'Absences, punctuality, and being present.', icon: 'calendar' },
    { id: 'academics', title: 'Academics', description: 'Coursework, learning, and academic expectations.', icon: 'cap' },
    { id: 'student-conduct', title: 'Student Conduct', description: 'Respect, responsibility, and our community.', icon: 'people' },
    { id: 'technology', title: 'Technology', description: 'Devices, digital resources, and responsible use.', icon: 'laptop' },
    { id: 'dress-code', title: 'Dress Code', description: 'Clothing and personal presentation.', icon: 'shirt' },
    { id: 'campus-policies', title: 'Campus Policies', description: 'School spaces, safety, and daily routines.', icon: 'building' },
  ],
  policies: [
    {
      id: 'reader-example', categoryId: 'attendance', title: 'Attendance · reader example',
      excerpt: 'An example of how a handbook section will be presented once official content is connected.',
      blocks: [
        { type: 'paragraph', text: 'This is sample interface content, not an official school policy. It demonstrates the reading layout while the team connects the student handbook.' },
        { type: 'heading', id: 'section-overview', text: 'Section overview', level: 2 },
        { type: 'paragraph', text: 'The official handbook text will appear here exactly as supplied by the content system. Headings, paragraphs, and lists are styled for comfortable reading on both small and large screens.' },
        { type: 'heading', id: 'source-references', text: 'Source references', level: 2 },
        { type: 'paragraph', text: 'When source metadata is available, this page can show the handbook edition, page reference, and a link to the original document. No source details have been provided yet.' },
        { type: 'heading', id: 'reading-tools', text: 'Reading tools', level: 2 },
        { type: 'list', items: ['Use the section navigation to move through the handbook.', 'Use “On this page” to jump to a heading.', 'Copy a link to return to this section or share the layout with your team.'] },
      ],
    },
  ],
};

/** Fixed result examples for /preview only. Never returned as live search matches. */
export const previewResults: SearchResult[] = [
  { id: 'sample-result', title: 'Attendance · reader example', excerpt: 'Preview how a relevant handbook excerpt, category, and section link appear in the search results.', category: 'Attendance', href: '/policy/reader-example' },
];
