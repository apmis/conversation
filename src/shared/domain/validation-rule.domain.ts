export type ValidationRule = {
  type: 'required' | 'min' | 'max' | 'regex' | 'custom';
  value?: any;
  message?: string;
};