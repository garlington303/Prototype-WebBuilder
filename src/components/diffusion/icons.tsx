import {
  ChevronUp,
  ChevronDown,
  Settings,
  Sparkles,
  Camera,
  Download,
  RefreshCw,
  Image,
  Plus,
  X,
  Brush,
} from 'lucide-react';

export const Icons = {
  ChevronUp: (props: React.ComponentProps<typeof ChevronUp>) => <ChevronUp {...props} />,
  ChevronDown: (props: React.ComponentProps<typeof ChevronDown>) => <ChevronDown {...props} />,
  Settings: (props: React.ComponentProps<typeof Settings>) => <Settings {...props} />,
  Sparkles: (props: React.ComponentProps<typeof Sparkles>) => <Sparkles {...props} />,
  Camera: (props: React.ComponentProps<typeof Camera>) => <Camera {...props} />,
  Download: (props: React.ComponentProps<typeof Download>) => <Download {...props} />,
  Refresh: (props: React.ComponentProps<typeof RefreshCw>) => <RefreshCw {...props} />,
  Image: (props: React.ComponentProps<typeof Image>) => <Image {...props} />,
  Plus: (props: React.ComponentProps<typeof Plus>) => <Plus {...props} />,
  Close: (props: React.ComponentProps<typeof X>) => <X {...props} />,
  Brush: (props: React.ComponentProps<typeof Brush>) => <Brush {...props} />,
};
