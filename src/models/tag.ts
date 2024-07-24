type Tag = {
  tagId: number;
  name: string;
};

type UserTag = {
  email: string;
  tagName: string;
  interactionCount: number;
};

type TagResponse = Tag;
type UserTagResponse = UserTag;

export type { Tag, TagResponse, UserTag, UserTagResponse };
