-- 031_seed_challenge_brief_metadata.sql
-- Adds full challenge brief/requirements/evaluation metadata for seeded challenges.

update public.challenges
set metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
  'objective',
  'Build a production-ready feature for a web application. The feature must include frontend implementation, clean state handling, validation, responsive UI, and at least basic tests.',
  'task',
  'Build a Challenge Submission feature for Tierd: users open challenge details, join, submit repository/demo/explanation, and track participants + ranking.',
  'expected_output',
  'One complete feature delivered, deployed, and documented.',
  'functional_requirements',
  jsonb_build_array(
    'User can view challenge title, description, category, difficulty, reward, deadline, and rules.',
    'User can join the challenge only once.',
    'Joined user can submit a GitHub repository URL.',
    'Joined user can submit an optional live demo URL.',
    'User can update submission before deadline.',
    'System validates that repository URL is valid.',
    'System blocks submission after deadline.',
    'Challenge page displays participant list.',
    'Challenge page displays ranking after evaluation.',
    'Winner receives ranking points and reward points.'
  ),
  'technical_requirements',
  jsonb_build_array(
    'Repository URL is required.',
    'Repository URL must start with https://github.com/.',
    'Live demo URL must be valid if provided.',
    'Description must be at least 50 characters.',
    'Submission is disabled after deadline.'
  ),
  'submission_requirements',
  jsonb_build_array(
    'Repository URL *',
    'Live Demo URL',
    'Description *',
    'Test Command',
    'Demo Video URL'
  ),
  'evaluation_criteria',
  jsonb_build_array(
    jsonb_build_object('title', 'Functionality', 'points', 35, 'bullets', jsonb_build_array('Feature works as described', 'Main user flow is complete', 'Edge cases are handled')),
    jsonb_build_object('title', 'Code Quality', 'points', 20, 'bullets', jsonb_build_array('Clean structure', 'Reusable components', 'No unnecessary duplicated logic', 'Clear naming')),
    jsonb_build_object('title', 'UI/UX', 'points', 15, 'bullets', jsonb_build_array('Responsive layout', 'Clear visual hierarchy', 'Good feedback states: loading, success, error')),
    jsonb_build_object('title', 'Testing', 'points', 15, 'bullets', jsonb_build_array('At least 3 meaningful tests', 'Tests cover main functionality', 'Test command is documented')),
    jsonb_build_object('title', 'Deployment & Demo', 'points', 10, 'bullets', jsonb_build_array('Live demo works', 'Repository is accessible', 'Demo explanation is clear')),
    jsonb_build_object('title', 'Documentation', 'points', 5, 'bullets', jsonb_build_array('README explains setup, feature, and usage'))
  ),
  'rules_list',
  jsonb_build_array(
    'Deadline is strict.',
    'No plagiarism.',
    'Repo must be public or accessible.',
    'Demo must work.',
    'Late submissions are rejected.'
  ),
  'restrictions',
  jsonb_build_array(
    'No plagiarism.',
    'Repository must be public or accessible.',
    'Demo must be functional.',
    'Late submissions are rejected.'
  )
)
where slug in ('release3-active-web-sprint', 'release3-upcoming-api-sprint');

