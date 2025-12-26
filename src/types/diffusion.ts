// ============================================
// RETRODIFFUSION TYPES
// Pixel art AI generation types and configurations
// ============================================

// ============================================
// RETRODIFFUSION MODELS (Official API)
// ============================================

export enum RDModel {
  PRO = 'rd_pro',
  FAST = 'rd_fast',
  PLUS = 'rd_plus',
  MINI = 'rd_mini',
}

export const MODEL_INFO: Record<RDModel, { name: string; description: string; icon: string; badge?: string; notification?: boolean }> = {
  [RDModel.PRO]: { name: 'RD Pro', description: 'Advanced with reference images', icon: '👑', badge: 'NEW' },
  [RDModel.FAST]: { name: 'RD Fast', description: '~2-3 sec, quick iterations', icon: '⚡' },
  [RDModel.PLUS]: { name: 'RD Plus', description: 'Premium quality output', icon: '✨' },
  [RDModel.MINI]: { name: 'RD Mini', description: 'Small 32x32 model', icon: '🐥' },
};

// ============================================
// GENERATION MODES
// ============================================

export enum GenerationMode {
  CHARACTER = 'character',
  TILESET = 'tileset',
  ITEM = 'item',
  ANIMATION = 'animation',
}

export const MODE_INFO: Record<
  GenerationMode,
  { name: string; description: string; icon: string; badge?: string; notification?: boolean }
> = {
  [GenerationMode.CHARACTER]: { name: 'Character', description: 'Sprites & animations', icon: '🧙' },
  [GenerationMode.TILESET]: { name: 'Tileset', description: 'Terrain & environments', icon: '🗺️', badge: 'NEW' },
  [GenerationMode.ITEM]: { name: 'Items', description: 'Weapons, potions & icons', icon: '⚔️' },
  [GenerationMode.ANIMATION]: { name: 'Animation', description: 'Animated sprites', icon: '🎬', notification: true },
};

// ============================================
// TILESET TYPES
// ============================================

export enum TilesetStyle {
  BASIC = 'rd_tile__tileset',
  ADVANCED = 'rd_tile__tileset_advanced',
  TOPDOWN = 'rd_plus__topdown_asset',
  ISOMETRIC = 'rd_plus__isometric_asset',
}

export enum TilesetFormat {
  WANG_16 = 'wang_16',
  WANG_48 = 'wang_48',
  PLATFORMER_9 = 'platformer_9',
  SINGLE = 'single',
}

export interface TilesetConfig {
  style: TilesetStyle;
  format: TilesetFormat;
  size: number;
  primaryTerrain: string;
  secondaryTerrain: string;
}

// ============================================
// CHARACTER SPRITE TYPES
// ============================================

export enum CharacterStyle {
  TURNAROUND = 'rd_plus__character_turnaround',
  DEFAULT = 'rd_plus__default',
  RETRO = 'rd_plus__retro',
  CLASSIC = 'rd_plus__classic',
  LOW_RES = 'rd_plus__low_res',
}

export enum CharacterView {
  FRONT = 'front',
  SIDE = 'side',
  BACK = 'back',
  TURNAROUND = 'turnaround',
  DAGGERFALL = 'daggerfall',
  BILLBOARDED = 'billboarded',
}

export enum CharacterAction {
  IDLE = 'idle',
  WALK = 'walk',
  RUN = 'run',
  ATTACK = 'attack',
  DEATH = 'death',
  JUMP = 'jump',
}

export interface CharacterConfig {
  style: CharacterStyle;
  view: CharacterView;
  action: CharacterAction;
  size: number;
  frames: number;
}

// ============================================
// DEFAULT CONFIGS
// ============================================

export const DEFAULT_TILESET_CONFIG: TilesetConfig = {
  style: TilesetStyle.BASIC,
  format: TilesetFormat.SINGLE,
  size: 32,
  primaryTerrain: 'grass',
  secondaryTerrain: 'dirt',
};

export const DEFAULT_CHARACTER_CONFIG: CharacterConfig = {
  style: CharacterStyle.TURNAROUND,
  view: CharacterView.FRONT,
  action: CharacterAction.IDLE,
  size: 64,
  frames: 1,
};

// ============================================
// STYLE PRESETS
// ============================================

export interface StylePreset {
  id: string;
  name: string;
  shortName?: string;
  description: string;
  icon: string;
  apiStyle: string;
  isNew?: boolean;
  isBeta?: boolean;
}

export const TILESET_PRESETS: StylePreset[] = [
  { id: 'basic', name: 'Basic Tile', description: 'Simple pixel art tile', icon: '🟩', apiStyle: 'rd_tile__tileset' },
  { id: 'advanced', name: 'Advanced Tile', description: 'Detailed tileset with transitions', icon: '🗺️', apiStyle: 'rd_tile__tileset_advanced' },
  { id: 'topdown', name: 'Top-Down', description: 'RPG-style overhead view', icon: '⬇️', apiStyle: 'rd_plus__topdown_asset' },
  { id: 'isometric', name: 'Isometric', description: '2.5D angled perspective', icon: '🔷', apiStyle: 'rd_plus__isometric_asset' },
];

export const ITEM_PRESETS: StylePreset[] = [
  { id: 'skill_icon', name: 'Skill Icon', description: 'Ability/spell icons', icon: '⚔️', apiStyle: 'rd_plus__skill_icon' },
  { id: 'topdown_item', name: 'Top-Down Item', description: 'RPG inventory items', icon: '🧪', apiStyle: 'rd_plus__topdown_item' },
  { id: 'item_sheet', name: 'Item Sheet', description: 'Multiple items on sheet', icon: '📦', apiStyle: 'rd_plus__item_sheet' },
  { id: 'ui_element', name: 'UI Element', description: 'Buttons and interface', icon: '🎨', apiStyle: 'rd_plus__ui_element' },
];

export const RD_FAST_PRESETS: StylePreset[] = [
  { id: 'default', name: 'Default', description: 'Simple clean pixel art with anime influences', icon: '✏️', apiStyle: 'rd_fast__default' },
  { id: 'simple', name: 'Simple', description: 'Minimalist shapes and designs', icon: '☆', apiStyle: 'rd_fast__simple' },
  { id: 'detailed', name: 'Detailed', description: 'Extensive shading and details', icon: '✦', apiStyle: 'rd_fast__detailed' },
  { id: 'retro', name: 'Retro', description: 'Classic arcade aesthetic', icon: '✏️', apiStyle: 'rd_fast__retro' },
  { id: 'game_asset', name: 'Game Asset', description: 'Distinct assets on simple background', icon: '🎮', apiStyle: 'rd_fast__game_asset' },
  { id: 'portrait', name: 'Portrait', description: 'Character portraits with high detail', icon: '👤', apiStyle: 'rd_fast__portrait' },
  { id: 'texture', name: 'Texture', description: 'Flat textures like stone, brick, wood', icon: '🧱', apiStyle: 'rd_fast__texture' },
  { id: 'ui', name: 'UI Element', description: 'UI boxes and buttons', icon: '🖼️', apiStyle: 'rd_fast__ui' },
  { id: 'item_sheet', name: 'Item Sheet', description: 'Multiple items on sheet', icon: '📋', apiStyle: 'rd_fast__item_sheet' },
  { id: 'character_turnaround', name: 'Character Turnaround', shortName: 'Char Turn', description: 'Multi-angle character sprites', icon: '👥', apiStyle: 'rd_fast__character_turnaround' },
  { id: '1_bit', name: '1-bit', description: 'Two-color black & white', icon: '⬛', apiStyle: 'rd_fast__1_bit' },
  { id: 'low_res', name: 'Low Resolution', shortName: 'Low Res', description: 'Low resolution pixel art (16-128px)', icon: '🔲', apiStyle: 'rd_fast__low_res' },
  { id: 'mc_item', name: 'MC Item', description: 'Minecraft-styled items', icon: '⛏️', apiStyle: 'rd_fast__mc_item' },
  { id: 'mc_texture', name: 'MC Texture', description: 'Minecraft-styled textures', icon: '🟫', apiStyle: 'rd_fast__mc_texture' },
  { id: 'no_style', name: 'No Style', description: 'No style influence applied', icon: '✕', apiStyle: 'rd_fast__no_style' },
];

export const ANIMATION_PRESETS: StylePreset[] = [
  { id: '8_dir_rotation', name: '8 Direction Rotation', description: 'Create 8 direction rotations of anything.', icon: '🔄', apiStyle: 'animation__8_dir_rotation', isNew: true },
  { id: 'any_animation', name: 'Any Animation', description: 'Animate anything with text prompts.', icon: '✨', apiStyle: 'animation__any_animation', isNew: true },
  { id: 'big_animation', name: 'Big Animation', description: 'Larger canvas animations.', icon: '🎬', apiStyle: 'animation__big_animation', isNew: true },
  { id: 'walking_and_idle', name: 'Walking & Idle', description: 'Walking and idle states.', icon: '🧍', apiStyle: 'animation__walking_and_idle' },
  { id: 'four_angle_walking', name: 'Four Angle Walk', description: '4-angle walking animation.', icon: '🚶', apiStyle: 'animation__four_angle_walking' },
  { id: 'battle_sprites', name: 'Battle Sprites', description: 'Combat optimized sprites.', icon: '⚔️', apiStyle: 'animation__battle_sprites', isBeta: true },
  { id: 'small_sprites', name: 'Small Sprites', description: 'Optimized for small sizes.', icon: '👾', apiStyle: 'animation__small_sprites', isNew: true },
  { id: 'vfx', name: 'Visual Effects', description: 'Effects like fire and lightning.', icon: '💥', apiStyle: 'animation__vfx' },
];

export const RD_PLUS_PRESETS: StylePreset[] = [
  { id: 'default', name: 'Default', description: 'Clean pixel art with bold colors and outlines', icon: '✏️', apiStyle: 'rd_plus__default' },
  { id: 'retro', name: 'Retro', description: 'Classic PC98-inspired style', icon: '✏️', apiStyle: 'rd_plus__retro' },
  { id: 'watercolor', name: 'Watercolor', description: 'Watercolor painting aesthetic', icon: '🖌️', apiStyle: 'rd_plus__watercolor' },
  { id: 'textured', name: 'Textured', description: 'Semi-realistic with lots of shading', icon: '🖌️', apiStyle: 'rd_plus__textured' },
  { id: 'cartoon', name: 'Cartoon', description: 'Simple shapes with bold outlines', icon: '🎨', apiStyle: 'rd_plus__cartoon' },
  { id: 'ui_element', name: 'UI Element', description: 'UI boxes and buttons', icon: '💬', apiStyle: 'rd_plus__ui_element' },
  { id: 'item_sheet', name: 'Item Sheet', description: 'Object sheets on simple background', icon: '📋', apiStyle: 'rd_plus__item_sheet' },
  { id: 'character_turnaround', name: 'Character Turnaround', shortName: 'Char Turn', description: 'Multi-angle character sprites', icon: '👥', apiStyle: 'rd_plus__character_turnaround' },
  { id: 'environment', name: 'Environments', shortName: 'Environ', description: 'One-point perspective scenes', icon: '🏔️', apiStyle: 'rd_plus__environment', isNew: true },
  { id: 'isometric', name: 'Isometric', shortName: 'Iso', description: '45° isometric perspective', icon: '🔷', apiStyle: 'rd_plus__isometric' },
  { id: 'isometric_asset', name: 'Isometric Asset', shortName: 'Iso Asset', description: 'Isometric objects on neutral bg', icon: '📦', apiStyle: 'rd_plus__isometric_asset' },
  { id: 'topdown_map', name: 'Top Down Map', shortName: 'TD Map', description: '3/4 top-down game maps', icon: '🗺️', apiStyle: 'rd_plus__topdown_map' },
  { id: 'topdown_asset', name: 'Top Down Asset', shortName: 'TD Asset', description: '3/4 top-down game assets', icon: '🏠', apiStyle: 'rd_plus__topdown_asset' },
  { id: 'topdown_item', name: 'Top Down Item', shortName: 'TD Item', description: 'Top-down view of items', icon: '⚔️', apiStyle: 'rd_plus__topdown_item' },
  { id: 'classic', name: 'Classic', description: 'Strongly outlined medium-res (32-192px)', icon: '🎮', apiStyle: 'rd_plus__classic' },
  { id: 'skill_icon', name: 'Skill Icon', description: 'Icons for skills/abilities', icon: '✨', apiStyle: 'rd_plus__skill_icon', isNew: true },
  { id: 'low_res', name: 'Low Resolution', description: 'Low res assets (16-128px)', icon: '🔲', apiStyle: 'rd_plus__low_res' },
  { id: 'mc_item', name: 'MC Item', description: 'Minecraft-styled items', icon: '⛏️', apiStyle: 'rd_plus__mc_item' },
  { id: 'mc_texture', name: 'MC Texture', description: 'Minecraft-style textures', icon: '🟫', apiStyle: 'rd_plus__mc_texture' },
];

export const RD_PRO_PRESETS: StylePreset[] = [
  { id: 'default', name: 'Default', description: 'Clean modern pixel art with reference images', icon: '✏️', apiStyle: 'rd_pro__default' },
  { id: 'painterly', name: 'Painterly', description: 'Brush-like with minimal outlines', icon: '✏️', apiStyle: 'rd_pro__painterly' },
  { id: 'simple', name: 'Simple', description: 'Minimal shading, strong outlines', icon: '☆', apiStyle: 'rd_pro__simple' },
  { id: 'fantasy', name: 'Fantasy', description: 'Bright colors, soft transitions', icon: '🏰', apiStyle: 'rd_pro__fantasy' },
  { id: 'horror', name: 'Horror', description: 'Dark, gritty with harsh shapes', icon: '💀', apiStyle: 'rd_pro__horror' },
  { id: 'scifi', name: 'Sci-fi', description: 'High contrast, glowing details', icon: '⚡', apiStyle: 'rd_pro__scifi' },
  { id: 'isometric', name: 'Isometric', description: '45° angle, clean lines', icon: '🔷', apiStyle: 'rd_pro__isometric' },
  { id: 'topdown', name: 'Top Down', description: '2/3 downwards angle view', icon: '🏠', apiStyle: 'rd_pro__topdown' },
  { id: 'platformer', name: 'Platformer', description: 'Side-scroller perspective', icon: '🎮', apiStyle: 'rd_pro__platformer' },
  { id: 'dungeon_map', name: 'Dungeon Map', description: 'Dungeon-crawler style levels', icon: '🗺️', apiStyle: 'rd_pro__dungeon_map' },
  { id: 'spritesheet', name: 'Spritesheet', description: 'Asset collections on simple bg', icon: '📋', apiStyle: 'rd_pro__spritesheet' },
  { id: 'fps_weapon', name: 'FPS Weapon', description: 'First-person weapon sprites', icon: '🔫', apiStyle: 'rd_pro__fps_weapon' },
  { id: 'typography', name: 'Typography', description: 'Pixel art text and lettering', icon: '🔤', apiStyle: 'rd_pro__typography', isNew: true },
  { id: 'pixelate', name: 'Pixelate', description: 'Convert images to pixel art', icon: '🖼️', apiStyle: 'rd_pro__pixelate', isNew: true },
  { id: 'edit', name: 'Edit', description: 'Image editing mode', icon: '✏️', apiStyle: 'rd_pro__edit', isNew: true },
];

export const RD_MINI_PRESETS: StylePreset[] = [
  { id: 'default', name: 'Default', description: 'Optimized for very small sprites', icon: '🐥', apiStyle: 'rd_mini__default' },
  { id: 'fast_low_res', name: 'Fast Low Res', description: 'Ultra-fast generation for tiny assets', icon: '⚡', apiStyle: 'rd_mini__fast_low_res' },
  { id: 'low_res', name: 'Low Res', description: 'Low-resolution mini assets', icon: '🔲', apiStyle: 'rd_mini__low_res' },
  { id: 'mc_item', name: 'MC Item', description: 'Minecraft item icons (small)', icon: '⛏️', apiStyle: 'rd_mini__mc_item' },
  { id: 'mc_texture', name: 'MC Texture', description: 'Tiny block textures', icon: '🟫', apiStyle: 'rd_mini__mc_texture' },
  { id: 'skill_icon', name: 'Skill Icon', description: 'Tiny skill and ability icons', icon: '✨', apiStyle: 'rd_mini__skill_icon' },
];
