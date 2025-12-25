import { Component } from '@/store/builder-store';
export function generateBlueprint(components: Component[]): string {
  const timestamp = new Date().toISOString();
  let markdown = `# Project Blueprint\n\n`;
  markdown += `Generated: ${timestamp}\n\n`;
  markdown += `## Structure\n\n`;
  if (components.length === 0) {
    markdown += `*No components added yet.*\n`;
    return markdown;
  }
  const renderNode = (node: Component, depth: number): string => {
    const indent = '  '.repeat(depth);
    let output = `${indent}- **${node.type.toUpperCase()}** (ID: \`${node.id}\`)\n`;
    // Props
    const props = Object.entries(node.props)
      .filter(([key]) => key !== 'children' && key !== 'className') // Skip children prop as it's structural, skip className for brevity unless needed
      .map(([key, value]) => `${key}: "${value}"`)
      .join(', ');
    if (props) {
      output += `${indent}  - Props: { ${props} }\n`;
    }
    // Specific content handling
    if (typeof node.props.children === 'string') {
      output += `${indent}  - Content: "${node.props.children}"\n`;
    }
    // Children
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        output += renderNode(child, depth + 1);
      });
    }
    return output;
  };
  components.forEach(component => {
    markdown += renderNode(component, 0);
  });
  markdown += `\n## Summary\n\n`;
  markdown += `Total Components: ${countComponents(components)}\n`;
  return markdown;
}
function countComponents(components: Component[]): number {
  let count = 0;
  components.forEach(c => {
    count += 1 + countComponents(c.children);
  });
  return count;
}