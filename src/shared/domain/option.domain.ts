export type QuestionOption = {
  id?: string;
  key: string;          // internal identifier
  label: string;        // text shown to user
  value: string;        // actual stored value
  index: number;
  groupId?: string;

  // Navigation
  jumpToQuestionId?: string;
  backToQuestionId?: string;
  childQuestionnaireId?: string;

  metadata?: Record<string, any>;
};