import { ComponentType } from '@/store/builder-store';
export const COMPONENT_ICONS: Record<ComponentType, string> = {
  container: 'Box',
  button: 'MousePointerClick',
  card: 'LayoutTemplate',
  header: 'Heading',
  text: 'Type',
  input: 'FormInput',
};
export const COMPONENT_LABELS: Record<ComponentType, string> = {
  container: 'Container',
  button: 'Button',
  card: 'Card',
  header: 'Heading',
  text: 'Text Block',
  input: 'Input Field',
};