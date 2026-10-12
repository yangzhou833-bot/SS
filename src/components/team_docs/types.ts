export type DocType =
  | 'page'
  | 'meeting_notes'
  | 'project_plan'
  | 'todo_list'
  | 'knowledge_base'
  | 'database'
  | 'file'
  | 'folder';

export type SpaceCategory = 'team' | 'personal';

export interface DocCollaborator {
  id: string;
  name: string;
  avatar: string;
  role?: string;
  isOnline?: boolean;
}

export type BlockType =
  | 'paragraph'
  | 'h1'
  | 'h2'
  | 'todo'
  | 'bullet'
  | 'numbered'
  | 'quote'
  | 'code'
  | 'divider'
  | 'table'
  | 'attachment'
  | 'columns';

export interface DocBlock {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
  tableData?: string[][];
  fileMeta?: {
    name: string;
    size: string;
    type: string;
    uploader: string;
    date: string;
  };
  columnLeft?: string;
  columnRight?: string;
}

export interface DatabaseRowItem {
  id: string;
  task: string;
  owner: {
    name: string;
    avatar: string;
  };
  status: '未开始' | '进行中' | '已完成';
  dueDate: string;
  tag: string;
  budget?: string;
}

export interface DocComment {
  id: string;
  author: string;
  avatar: string;
  time: string;
  content: string;
  resolved: boolean;
}

export interface DocVersion {
  id: string;
  versionNumber: string;
  author: string;
  authorAvatar: string;
  time: string;
  summary: string;
  blocksSnapshot: DocBlock[];
}

export interface MemberPermission {
  id: string;
  name: string;
  avatar: string;
  role: string;
  access: 'view' | 'comment' | 'edit';
}

export interface TeamDocItem {
  id: string;
  title: string;
  type: DocType;
  spaceCategory: SpaceCategory;
  spaceName: string;
  icon: string;
  updatedAt: string;
  updatedBy: string;
  authorAvatar: string;
  collaborators: DocCollaborator[];
  tags: string[];
  size?: string;
  fileUrl?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  isDeleted?: boolean;
  parentFolderId?: string | null;
  commentsCount?: number;
  comments?: DocComment[];
  blocks?: DocBlock[];
  databaseRows?: DatabaseRowItem[];
  versions?: DocVersion[];
  permissions?: MemberPermission[];
  linkAccess?: 'view' | 'comment' | 'edit';
  isLinkSharingEnabled?: boolean;
}

export interface FilterOptions {
  space?: string;
  type?: string;
  member?: string;
  tag?: string;
  timeRange?: string;
}
