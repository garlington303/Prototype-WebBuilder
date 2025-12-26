import React from 'react';
import { cn } from '@/lib/utils';
import { 
  ComponentType, 
  COMPONENT_CATALOG,
  LayoutContainerType,
  TypographyType,
  FormElementType,
  MediaType,
  NavigationType,
  DataDisplayType,
  FeedbackType,
} from '@/store/layout-store';
import { ChevronRight, Loader2, X, Check } from 'lucide-react';

// ============================================
// COMPONENT PROPS INTERFACE
// ============================================
export interface GenericComponentProps {
  type: ComponentType;
  props: Record<string, unknown>;
  children?: React.ReactNode;
  isEditMode?: boolean;
  onClick?: () => void;
}

// ============================================
// LAYOUT CONTAINERS
// ============================================
const LayoutContainer: React.FC<GenericComponentProps> = ({ type, props, children }) => {
  const className = props.className as string || '';
  
  switch (type as LayoutContainerType) {
    case 'CONTAINER':
      return (
        <div className={cn('p-4 min-h-[60px]', className)}>
          {children || <span className="text-zinc-500 text-sm">Container</span>}
        </div>
      );
    case 'FLEX_ROW':
      return (
        <div className={cn('flex flex-row gap-4 min-h-[60px]', className)}>
          {children || <span className="text-zinc-500 text-sm">Flex Row</span>}
        </div>
      );
    case 'FLEX_COL':
      return (
        <div className={cn('flex flex-col gap-4 min-h-[60px]', className)}>
          {children || <span className="text-zinc-500 text-sm">Flex Column</span>}
        </div>
      );
    case 'GRID_2':
      return (
        <div className={cn('grid grid-cols-2 gap-4 min-h-[60px]', className)}>
          {children || (
            <>
              <div className="bg-zinc-800/50 rounded p-4 text-zinc-500 text-sm">Column 1</div>
              <div className="bg-zinc-800/50 rounded p-4 text-zinc-500 text-sm">Column 2</div>
            </>
          )}
        </div>
      );
    case 'GRID_3':
      return (
        <div className={cn('grid grid-cols-3 gap-4 min-h-[60px]', className)}>
          {children || (
            <>
              <div className="bg-zinc-800/50 rounded p-4 text-zinc-500 text-sm">Col 1</div>
              <div className="bg-zinc-800/50 rounded p-4 text-zinc-500 text-sm">Col 2</div>
              <div className="bg-zinc-800/50 rounded p-4 text-zinc-500 text-sm">Col 3</div>
            </>
          )}
        </div>
      );
    case 'GRID_4':
      return (
        <div className={cn('grid grid-cols-4 gap-4 min-h-[60px]', className)}>
          {children || (
            <>
              <div className="bg-zinc-800/50 rounded p-2 text-zinc-500 text-xs">1</div>
              <div className="bg-zinc-800/50 rounded p-2 text-zinc-500 text-xs">2</div>
              <div className="bg-zinc-800/50 rounded p-2 text-zinc-500 text-xs">3</div>
              <div className="bg-zinc-800/50 rounded p-2 text-zinc-500 text-xs">4</div>
            </>
          )}
        </div>
      );
    case 'SECTION':
      return (
        <section className={cn('py-8 min-h-[100px]', className)}>
          {children || <span className="text-zinc-500 text-sm">Section</span>}
        </section>
      );
    case 'DIV':
      return (
        <div className={cn('min-h-[40px]', className)}>
          {children || <span className="text-zinc-500 text-sm">Div</span>}
        </div>
      );
    case 'CARD':
      return (
        <div className={cn('p-4 rounded-lg border border-zinc-700 bg-zinc-900', className)}>
          {children || (
            <div className="space-y-2">
              <h4 className="font-semibold text-white">Card Title</h4>
              <p className="text-sm text-zinc-400">Card content goes here</p>
            </div>
          )}
        </div>
      );
    case 'PANEL':
      return (
        <div className={cn('rounded-lg border border-zinc-700 overflow-hidden', className)}>
          <div className="px-4 py-2 bg-zinc-800 border-b border-zinc-700">
            <h4 className="font-medium text-white text-sm">{props.title as string || 'Panel'}</h4>
          </div>
          <div className="p-4">
            {children || <span className="text-zinc-500 text-sm">Panel content</span>}
          </div>
        </div>
      );
    case 'ACCORDION':
      return (
        <div className={cn('rounded-lg border border-zinc-700', className)}>
          <button className="w-full flex items-center justify-between px-4 py-3 text-white hover:bg-zinc-800/50">
            <span className="font-medium">Accordion Item</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      );
    case 'TABS':
      return (
        <div className={cn('', className)}>
          <div className="flex border-b border-zinc-700">
            <button className="px-4 py-2 text-sm font-medium text-purple-400 border-b-2 border-purple-500">Tab 1</button>
            <button className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white">Tab 2</button>
            <button className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white">Tab 3</button>
          </div>
          <div className="p-4">
            {children || <span className="text-zinc-500 text-sm">Tab content</span>}
          </div>
        </div>
      );
    default:
      return <div className="p-4 text-zinc-500">Unknown container</div>;
  }
};

// ============================================
// TYPOGRAPHY
// ============================================
const Typography: React.FC<GenericComponentProps> = ({ type, props }) => {
  const text = props.text as string || '';
  const className = props.className as string || '';
  
  switch (type as TypographyType) {
    case 'HEADING_1':
      return <h1 className={cn('text-4xl font-bold text-white', className)}>{text || 'Heading 1'}</h1>;
    case 'HEADING_2':
      return <h2 className={cn('text-2xl font-semibold text-white', className)}>{text || 'Heading 2'}</h2>;
    case 'HEADING_3':
      return <h3 className={cn('text-xl font-semibold text-white', className)}>{text || 'Heading 3'}</h3>;
    case 'HEADING_4':
      return <h4 className={cn('text-lg font-medium text-white', className)}>{text || 'Heading 4'}</h4>;
    case 'PARAGRAPH':
      return <p className={cn('text-zinc-300 leading-relaxed', className)}>{text || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}</p>;
    case 'TEXT_SPAN':
      return <span className={cn('text-zinc-300', className)}>{text || 'Text'}</span>;
    case 'LABEL':
      return <label className={cn('text-sm font-medium text-zinc-400', className)}>{text || 'Label'}</label>;
    case 'LINK':
      return (
        <a 
          href={props.href as string || '#'} 
          className={cn('text-lime-400 hover:text-lime-300 hover:underline', className)}
        >
          {text || 'Link'}
        </a>
      );
    case 'BLOCKQUOTE':
      return (
        <blockquote className={cn('border-l-4 border-purple-500 pl-4 italic text-zinc-400', className)}>
          {text || '"A notable quote..."'}
        </blockquote>
      );
    case 'CODE_BLOCK':
      return (
        <pre className={cn('bg-zinc-900 rounded-lg p-4 overflow-x-auto', className)}>
          <code className="text-sm text-lime-400 font-mono">
            {props.code as string || 'const example = "Hello World";'}
          </code>
        </pre>
      );
    default:
      return <span className="text-zinc-500">Unknown text</span>;
  }
};

// ============================================
// FORM ELEMENTS
// ============================================
const FormElement: React.FC<GenericComponentProps> = ({ type, props }) => {
  const label = props.label as string;
  const placeholder = props.placeholder as string;
  const className = props.className as string || '';
  const options = (props.options as string[]) || ['Option 1', 'Option 2', 'Option 3'];
  
  const renderInputField = (inputType: string) => (
    <div className={cn('space-y-1.5', className)}>
      {label && <label className="text-sm font-medium text-zinc-400">{label}</label>}
      <input
        type={inputType}
        placeholder={placeholder || 'Enter text...'}
        className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
      />
    </div>
  );
  
  switch (type as FormElementType) {
    case 'INPUT_TEXT':
      return renderInputField('text');
    case 'INPUT_EMAIL':
      return renderInputField('email');
    case 'INPUT_PASSWORD':
      return renderInputField('password');
    case 'INPUT_NUMBER':
      return renderInputField('number');
    case 'TEXTAREA':
      return (
        <div className={cn('space-y-1.5', className)}>
          {label && <label className="text-sm font-medium text-zinc-400">{label}</label>}
          <textarea
            placeholder={placeholder || 'Enter description...'}
            rows={(props.rows as number) || 4}
            className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
          />
        </div>
      );
    case 'SELECT':
      return (
        <div className={cn('space-y-1.5', className)}>
          {label && <label className="text-sm font-medium text-zinc-400">{label}</label>}
          <select className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-purple-500">
            {options.map((opt, i) => <option key={i}>{opt}</option>)}
          </select>
        </div>
      );
    case 'CHECKBOX':
      return (
        <label className={cn('flex items-center gap-2 cursor-pointer', className)}>
          <div className="w-4 h-4 rounded border border-zinc-600 bg-zinc-900 flex items-center justify-center">
            {props.checked && <Check className="w-3 h-3 text-lime-400" />}
          </div>
          <span className="text-sm text-zinc-300">{label || 'Checkbox option'}</span>
        </label>
      );
    case 'RADIO':
      return (
        <div className={cn('space-y-2', className)}>
          {label && <label className="text-sm font-medium text-zinc-400">{label}</label>}
          {options.map((opt, i) => (
            <label key={i} className="flex items-center gap-2 cursor-pointer">
              <div className="w-4 h-4 rounded-full border border-zinc-600 bg-zinc-900 flex items-center justify-center">
                {i === 0 && <div className="w-2 h-2 rounded-full bg-lime-400" />}
              </div>
              <span className="text-sm text-zinc-300">{opt}</span>
            </label>
          ))}
        </div>
      );
    case 'SWITCH':
      return (
        <label className={cn('flex items-center gap-3 cursor-pointer', className)}>
          <div className="relative w-10 h-5 rounded-full bg-zinc-700">
            <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-zinc-400 transition-transform" />
          </div>
          <span className="text-sm text-zinc-300">{label || 'Toggle switch'}</span>
        </label>
      );
    case 'SLIDER':
      return (
        <div className={cn('space-y-1.5', className)}>
          {label && <label className="text-sm font-medium text-zinc-400">{label}</label>}
          <input
            type="range"
            min={(props.min as number) || 0}
            max={(props.max as number) || 100}
            defaultValue={(props.value as number) || 50}
            className="w-full accent-purple-500"
          />
        </div>
      );
    case 'BUTTON': {
      const variant = (props.variant as string) || 'primary';
      const buttonStyles: Record<string, string> = {
        primary: 'bg-purple-600 hover:bg-purple-500 text-white',
        secondary: 'bg-zinc-700 hover:bg-zinc-600 text-white',
        outline: 'border border-zinc-600 hover:bg-zinc-800 text-white',
        ghost: 'hover:bg-zinc-800 text-zinc-300',
        destructive: 'bg-red-600 hover:bg-red-500 text-white',
      };
      return (
        <button className={cn(
          'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
          buttonStyles[variant] || buttonStyles.primary,
          className
        )}>
          {(props.text as string) || 'Button'}
        </button>
      );
    }
    case 'BUTTON_GROUP':
      return (
        <div className={cn('flex gap-2', className)}>
          <button className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm">Button 1</button>
          <button className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm">Button 2</button>
        </div>
      );
    case 'FORM':
      return (
        <form className={cn('space-y-4', className)}>
          <div className="text-zinc-500 text-sm p-4 border border-dashed border-zinc-700 rounded-lg text-center">
            Form container - drop form elements here
          </div>
        </form>
      );
    default:
      return <div className="text-zinc-500">Unknown form element</div>;
  }
};

// ============================================
// MEDIA
// ============================================
const Media: React.FC<GenericComponentProps> = ({ type, props }) => {
  const className = (props.className as string) || '';
  const src = props.src as string;
  const fallback = (props.fallback as string) || 'U';
  
  switch (type as MediaType) {
    case 'IMAGE':
      if (src) {
        return <img src={src} alt={(props.alt as string) || 'Image'} className={cn('rounded-lg', className)} />;
      }
      return (
        <div className={cn('bg-zinc-800 rounded-lg flex items-center justify-center aspect-video', className)}>
          <span className="text-zinc-500 text-sm">Image placeholder</span>
        </div>
      );
    case 'ICON':
      return (
        <div className={cn('inline-flex items-center justify-center', className)}>
          <span className="text-2xl">⭐</span>
        </div>
      );
    case 'AVATAR':
      return (
        <div className={cn('w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium', className)}>
          {fallback}
        </div>
      );
    case 'VIDEO_EMBED':
      return (
        <div className={cn('bg-zinc-800 rounded-lg flex items-center justify-center aspect-video', className)}>
          <span className="text-zinc-500 text-sm">Video embed placeholder</span>
        </div>
      );
    case 'PLACEHOLDER_IMAGE':
      return (
        <div 
          className={cn('bg-zinc-800 rounded-lg flex items-center justify-center', className)}
          style={{ 
            width: (props.width as number) || 200, 
            height: (props.height as number) || 150 
          }}
        >
          <span className="text-zinc-500 text-sm">{(props.text as string) || 'Image'}</span>
        </div>
      );
    default:
      return <div className="text-zinc-500">Unknown media</div>;
  }
};

// ============================================
// NAVIGATION
// ============================================
const NavigationComponent: React.FC<GenericComponentProps> = ({ type, props, children }) => {
  const className = (props.className as string) || '';
  const items = (props.items as string[]) || ['Home', 'Section', 'Page'];
  const tabs = (props.tabs as string[]) || ['Tab 1', 'Tab 2', 'Tab 3'];
  
  switch (type as NavigationType) {
    case 'NAVBAR':
      return (
        <nav className={cn('flex items-center justify-between px-4 h-14 bg-zinc-900 border-b border-zinc-800', className)}>
          <div className="font-bold text-white">Logo</div>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-zinc-300 hover:text-white">Home</a>
            <a href="#" className="text-sm text-zinc-300 hover:text-white">About</a>
            <a href="#" className="text-sm text-zinc-300 hover:text-white">Contact</a>
          </div>
        </nav>
      );
    case 'SIDEBAR_NAV':
      return (
        <nav className={cn('w-60 p-4 bg-zinc-900 border-r border-zinc-800', className)}>
          <div className="space-y-1">
            <a href="#" className="block px-3 py-2 rounded-lg bg-purple-600/20 text-purple-400 text-sm">Dashboard</a>
            <a href="#" className="block px-3 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 text-sm">Settings</a>
            <a href="#" className="block px-3 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 text-sm">Profile</a>
          </div>
        </nav>
      );
    case 'BREADCRUMBS':
      return (
        <nav className={cn('flex items-center gap-2 text-sm', className)}>
          {items.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="w-4 h-4 text-zinc-600" />}
              <a href="#" className={i === items.length - 1 ? 'text-white' : 'text-zinc-400 hover:text-white'}>
                {item}
              </a>
            </React.Fragment>
          ))}
        </nav>
      );
    case 'TABS_NAV':
      return (
        <div className={cn('flex border-b border-zinc-700', className)}>
          {tabs.map((tab, i) => (
            <button 
              key={i} 
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px',
                i === 0 ? 'text-purple-400 border-purple-500' : 'text-zinc-400 border-transparent hover:text-white'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      );
    case 'MENU':
      return (
        <div className={cn('space-y-1', className)}>
          <a href="#" className="block px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg">Menu Item 1</a>
          <a href="#" className="block px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg">Menu Item 2</a>
          <a href="#" className="block px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg">Menu Item 3</a>
        </div>
      );
    case 'DROPDOWN':
      return (
        <div className={cn('relative inline-block', className)}>
          <button className="flex items-center gap-2 px-3 py-2 text-sm bg-zinc-800 rounded-lg text-white">
            {(props.label as string) || 'Menu'}
            <ChevronRight className="w-4 h-4 rotate-90" />
          </button>
        </div>
      );
    default:
      return <div className="text-zinc-500">Unknown navigation</div>;
  }
};

// ============================================
// DATA DISPLAY
// ============================================
const DataDisplay: React.FC<GenericComponentProps> = ({ type, props }) => {
  const className = (props.className as string) || '';
  const badgeVariants: Record<string, string> = {
    default: 'bg-zinc-700 text-zinc-300',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    error: 'bg-red-500/20 text-red-400',
    info: 'bg-blue-500/20 text-blue-400',
  };
  const value = (props.value as number) || 65;
  const max = (props.max as number) || 100;
  const columns = (props.columns as string[]) || ['Name', 'Value'];
  
  switch (type as DataDisplayType) {
    case 'BADGE':
      return (
        <span className={cn(
          'inline-flex px-2 py-0.5 text-xs font-medium rounded',
          badgeVariants[(props.variant as string) || 'default'],
          className
        )}>
          {(props.text as string) || 'Badge'}
        </span>
      );
    case 'TAG':
      return (
        <span className={cn('inline-flex items-center gap-1 px-2 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-full', className)}>
          {(props.text as string) || 'Tag'}
          {props.removable && <X className="w-3 h-3 cursor-pointer hover:text-white" />}
        </span>
      );
    case 'STAT_CARD':
      return (
        <div className={cn('p-4 rounded-lg bg-zinc-900 border border-zinc-800', className)}>
          <p className="text-sm text-zinc-400">{(props.label as string) || 'Total Users'}</p>
          <p className="text-2xl font-bold text-white mt-1">{(props.value as string) || '1,234'}</p>
          {props.change && (
            <p className="text-sm text-green-400 mt-1">{props.change as string}</p>
          )}
        </div>
      );
    case 'PROGRESS_BAR':
      return (
        <div className={cn('space-y-1', className)}>
          {props.label && <p className="text-sm text-zinc-400">{props.label as string}</p>}
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${(value / max) * 100}%` }}
            />
          </div>
        </div>
      );
    case 'LIST':
      return (
        <ul className={cn('space-y-2', className)}>
          <li className="text-sm text-zinc-300">• List item 1</li>
          <li className="text-sm text-zinc-300">• List item 2</li>
          <li className="text-sm text-zinc-300">• List item 3</li>
        </ul>
      );
    case 'LIST_ITEM':
      return (
        <li className={cn('text-sm text-zinc-300', className)}>
          • {(props.text as string) || 'List item'}
        </li>
      );
    case 'TABLE':
      return (
        <table className={cn('w-full text-sm', className)}>
          <thead>
            <tr className="border-b border-zinc-700">
              {columns.map((col, i) => (
                <th key={i} className="text-left py-2 px-3 text-zinc-400 font-medium">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-zinc-800">
              <td className="py-2 px-3 text-zinc-300">Example</td>
              <td className="py-2 px-3 text-zinc-300">Value</td>
            </tr>
          </tbody>
        </table>
      );
    case 'DIVIDER':
      return <hr className={cn('border-t border-zinc-700 my-4', className)} />;
    case 'SPACER':
      return <div style={{ height: (props.height as number) || 32 }} className={className} />;
    default:
      return <div className="text-zinc-500">Unknown data display</div>;
  }
};

// ============================================
// FEEDBACK
// ============================================
const Feedback: React.FC<GenericComponentProps> = ({ type, props }) => {
  const className = (props.className as string) || '';
  const alertVariants: Record<string, { bg: string; border: string; text: string }> = {
    info: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
    success: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
    warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
    error: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  };
  const sizes: Record<string, string> = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  
  switch (type as FeedbackType) {
    case 'ALERT': {
      const variant = alertVariants[(props.variant as string) || 'info'];
      return (
        <div className={cn('p-4 rounded-lg border', variant.bg, variant.border, className)}>
          {props.title && <p className={cn('font-medium', variant.text)}>{props.title as string}</p>}
          <p className={cn('text-sm mt-1', variant.text)}>{(props.message as string) || 'Alert message'}</p>
        </div>
      );
    }
    case 'TOAST':
      return (
        <div className={cn('flex items-center gap-3 px-4 py-3 bg-zinc-800 rounded-lg shadow-lg', className)}>
          <Check className="w-4 h-4 text-green-400" />
          <p className="text-sm text-white">{(props.message as string) || 'Action completed!'}</p>
        </div>
      );
    case 'TOOLTIP':
      return (
        <div className={cn('px-2 py-1 bg-zinc-800 text-xs text-white rounded shadow-lg', className)}>
          {(props.text as string) || 'Tooltip'}
        </div>
      );
    case 'MODAL':
      return (
        <div className={cn('p-6 bg-zinc-900 rounded-xl border border-zinc-700 shadow-2xl max-w-md', className)}>
          <h3 className="text-lg font-semibold text-white">{(props.title as string) || 'Modal Title'}</h3>
          <p className="text-sm text-zinc-400 mt-2">Modal content goes here...</p>
          <div className="flex justify-end gap-2 mt-6">
            <button className="px-4 py-2 text-sm bg-zinc-700 text-white rounded-lg">Cancel</button>
            <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg">Confirm</button>
          </div>
        </div>
      );
    case 'LOADING_SPINNER':
      return (
        <Loader2 className={cn('animate-spin text-purple-500', sizes[(props.size as string) || 'md'], className)} />
      );
    default:
      return <div className="text-zinc-500">Unknown feedback</div>;
  }
};

// ============================================
// MAIN RENDER FUNCTION
// ============================================
export function renderGenericComponent(componentProps: GenericComponentProps): React.ReactNode {
  const { type } = componentProps;
  const info = COMPONENT_CATALOG[type];
  
  if (!info) {
    return <div className="p-4 text-red-500 text-sm">Unknown component: {type}</div>;
  }

  // Route to correct renderer based on category
  switch (info.category) {
    case 'layout':
      return <LayoutContainer {...componentProps} />;
    case 'typography':
      return <Typography {...componentProps} />;
    case 'form':
      return <FormElement {...componentProps} />;
    case 'media':
      return <Media {...componentProps} />;
    case 'navigation':
      return <NavigationComponent {...componentProps} />;
    case 'data':
      return <DataDisplay {...componentProps} />;
    case 'feedback':
      return <Feedback {...componentProps} />;
    default:
      return null; // RD components handled separately
  }
}
